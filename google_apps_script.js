/**
 * ============================================================================
 * [소마플로우 PT 스튜디오] 1:1 방문 상담 신청 자동 접수 스크립트 (Google Apps Script)
 * ============================================================================
 *
 * [기능]
 * 1. 웹사이트(https://somaflow.kr)에서 고객이 1:1 상담을 신청하면
 *    구글 스프레드시트에 [접수일시, 성함, 연락처, 관심 프로그램, 희망 시간대, 문의내용, 상담상태]가 자동 저장됩니다.
 * 2. 동시에 아래 설정한 운영자 이메일(NOTIFY_EMAIL)로 실시간 알림 메일이 발송됩니다.
 *
 * [설치 방법 (3분 완성)]
 * 1. 구글 스프레드시트(https://sheets.new) 새 문서를 하나 만들고 제목을 "소마플로우 상담신청 내역"으로 저장합니다.
 * 2. 상단 메뉴 [확장 프로그램] -> [Apps Script]를 클릭합니다.
 * 3. 기존 코드를 모두 지우고, 이 파일의 코드를 전부 복사해서 붙여넣은 뒤 저장(Ctrl+S / Cmd+S)합니다.
 *    (아래 NOTIFY_EMAIL 변수에 알림 받을 본인 이메일 주소를 입력해 주세요)
 * 4. 우측 상단 [배포] -> [새 배포] 클릭 -> 유형 선택(톱니바퀴)에서 [웹 앱] 선택:
 *    - 설명: 소마플로우 상담 폼 연동
 *    - 다음 사용자 인증 정보로 실행: 나 (Me)
 *    - 액세스 권한이 있는 사용자: 모든 사용자 (Anyone)  <-- ★ 중요! 반드시 '모든 사용자'로 선택
 * 5. [배포] 클릭 -> [액세스 승인] 클릭 -> 본인 구글 계정 선택 -> [고급] -> [안전하지 않은 페이지로 이동] -> [허용]
 * 6. 발급된 [웹 앱 URL] (https://script.google.com/macros/s/....../exec)을 복사하여
 *    GitHub의 js/main.js 파일 상단 GOOGLE_SCRIPT_URL = "여기에_붙여넣기" 에 넣고 Commit 하면 완료!
 *
 * [코드를 수정한 뒤에는] [배포] -> [배포 관리] -> 연필(수정) -> 버전: [새 버전] -> [배포]를 눌러야
 *    수정 내용이 실제 웹앱에 반영됩니다. (URL은 그대로 유지됩니다)
 */

// ★ 알림 메일을 받을 운영자 이메일 주소를 입력하세요 (비워두면 구글 시트 소유자 이메일로 발송됩니다)
const NOTIFY_EMAIL = "";

// ---------------------------------------------------------------------------
// 보안 설정 (필요 시 숫자만 조정하세요)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_SEC = 600;   // 10분 단위로
const RATE_LIMIT_MAX = 15;           // 전체 접수 최대 15건 (초과분은 거절 → 스팸/메일 한도 소진 방지)
const DUPLICATE_WINDOW_SEC = 600;    // 같은 연락처는 10분 안에 한 번만 접수

const MAX_LEN = { name: 30, message: 1000 };
const ALLOWED_INTEREST = ["근골격계 운동", "퍼스널 트레이닝", "기구 필라테스", "5-Flow 종합 상담"];
const ALLOWED_TIME = [
  "평일 오전 (10:00 ~ 13:00)",
  "평일 오후 (13:00 ~ 17:00)",
  "평일 저녁 (17:00 ~ 21:00)",
  "토요일 (10:00 ~ 15:00)"
];

// 문자열 정리: 제어문자 제거, 앞뒤 공백 제거, 길이 제한
function cleanText(value, maxLen, keepNewlines) {
  let s = String(value == null ? "" : value);
  s = keepNewlines
    ? s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
    : s.replace(/[\u0000-\u001F\u007F]/g, " ");
  s = s.trim();
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

// 구글 시트 수식 주입 방지: =, +, -, @ 로 시작하면 앞에 ' 를 붙여 일반 텍스트로 저장
function sheetSafe(value) {
  const s = String(value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// 알림 메일 HTML 주입 방지
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 연락처 검증: 숫자만 추려 국내 번호 형식(0으로 시작, 9~11자리)인지 확인 후 하이픈 형식으로 반환
function normalizePhone(value) {
  const digits = String(value == null ? "" : value).replace(/\D/g, "");
  if (!/^0\d{8,10}$/.test(digits)) return null;
  if (digits.length === 11) return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  if (digits.startsWith("02")) return digits.replace(/(\d{2})(\d{3,4})(\d{4})/, "$1-$2-$3");
  return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
}

function jsonResponse(status, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: status, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // 전송된 데이터 파싱 (JSON 또는 Form Data 모두 지원)
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (_) {
        data = (e && e.parameter) || {};
      }
    } else {
      data = (e && e.parameter) || {};
    }
    if (!data || typeof data !== "object") data = {};

    // 봇 차단: 화면에 보이지 않는 website 칸이 채워져 있으면 저장·발송 없이 성공처럼 응답
    if (cleanText(data.website, 200)) {
      return jsonResponse("success", "상담 신청이 접수되었습니다.");
    }

    // 입력값 검증
    const name = cleanText(data.name, MAX_LEN.name);
    const phone = normalizePhone(data.phone);
    const interest = ALLOWED_INTEREST.indexOf(data.interest) >= 0 ? data.interest : "(미선택)";
    const time = ALLOWED_TIME.indexOf(data.time) >= 0 ? data.time : "(미선택)";
    const message = cleanText(data.message, MAX_LEN.message, true) || "-";

    if (data.consent !== true && data.consent !== "true") {
      return jsonResponse("error", "개인정보 수집·이용 동의가 필요합니다.");
    }

    if (!name || !phone) {
      return jsonResponse("error", "성함과 올바른 연락처를 입력해 주세요.");
    }

    lock.waitLock(10000);

    // 접수량 제한 + 같은 연락처 중복 접수 차단
    const cache = CacheService.getScriptCache();
    const bucket = "rate_" + Math.floor(Date.now() / 1000 / RATE_LIMIT_WINDOW_SEC);
    const count = Number(cache.get(bucket) || 0);
    if (count >= RATE_LIMIT_MAX) {
      return jsonResponse("error", "접수가 일시적으로 많습니다. 잠시 후 다시 시도하거나 네이버 톡톡으로 문의해 주세요.");
    }
    const dupKey = "phone_" + phone.replace(/\D/g, "");
    if (cache.get(dupKey)) {
      return jsonResponse("success", "이미 접수된 신청입니다. 곧 연락드리겠습니다.");
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 첫 번째 줄(헤더)이 비어있다면 자동으로 열 제목을 생성합니다.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "접수일시",
        "성함",
        "연락처",
        "관심 프로그램",
        "희망 방문 시간대",
        "문의사항 및 고민 부위",
        "상담 상태"
      ]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#F5EFE2");
    }

    const timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");

    // 1. 구글 스프레드시트에 새로운 행 추가 (모든 값은 텍스트로 저장되도록 처리)
    sheet.appendRow([
      timestamp,
      sheetSafe(name),
      sheetSafe(phone),
      sheetSafe(interest),
      sheetSafe(time),
      sheetSafe(message),
      "신규 접수"
    ]);

    cache.put(bucket, String(count + 1), RATE_LIMIT_WINDOW_SEC);
    cache.put(dupKey, "1", DUPLICATE_WINDOW_SEC);
    lock.releaseLock();

    // 2. 운영자 이메일로 실시간 알림 발송 (모든 입력값은 HTML 이스케이프 처리)
    const recipient = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
    if (recipient) {
      const h = {
        timestamp: escapeHtml(timestamp),
        name: escapeHtml(name),
        phone: escapeHtml(phone),
        tel: phone.replace(/\D/g, ""),
        interest: escapeHtml(interest),
        time: escapeHtml(time),
        message: escapeHtml(message)
      };
      const subject = `[소마플로우 상담신청] ${name}님 (${phone}) 1:1 방문 상담이 접수되었습니다.`;
      const htmlBody = `
        <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 560px; padding: 24px; border: 1px solid #E6DECE; border-radius: 12px; background: #FCFBF8; color: #2B2724;">
          <p style="font-size: 11px; letter-spacing: 0.2em; color: #A8862B; font-weight: bold; margin: 0 0 8px;">SOMAFLOW PT STUDIO</p>
          <h2 style="margin: 0 0 18px; font-size: 20px; color: #2B2724;">신규 1:1 방문 상담 신청 내역</h2>
          <table style="width: 100%; border-collapse: collapse; background: #FFFFFF; border: 1px solid #E6DECE; border-radius: 8px;">
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6; font-weight: bold; width: 130px; color: #7A7168;">접수 일시</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6;">${h.timestamp}</td>
            </tr>
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6; font-weight: bold; color: #7A7168;">성함</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6;"><strong>${h.name}</strong></td>
            </tr>
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6; font-weight: bold; color: #7A7168;">연락처</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6;"><a href="tel:${h.tel}" style="color: #A8862B; font-weight: bold; text-decoration: none;">${h.phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6; font-weight: bold; color: #7A7168;">관심 프로그램</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6;">${h.interest}</td>
            </tr>
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6; font-weight: bold; color: #7A7168;">희망 시간대</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6;">${h.time}</td>
            </tr>
            <tr>
              <td style="padding: 12px 14px; font-weight: bold; color: #7A7168;">문의 및 고민부위</td>
              <td style="padding: 12px 14px; white-space: pre-wrap;">${h.message}</td>
            </tr>
          </table>
          <p style="margin: 18px 0 0; font-size: 12px; color: #A39A86;">
            본 메일은 소마플로우 웹사이트(somaflow.kr) 상담 신청 폼에서 자동 발송되었습니다.
          </p>
        </div>
      `;

      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        htmlBody: htmlBody
      });
    }

    return jsonResponse("success", "상담 신청이 접수되었습니다.");

  } catch (error) {
    // 내부 오류 내용은 외부에 노출하지 않고 Apps Script 실행 로그에만 남깁니다.
    console.error(error);
    return jsonResponse("error", "일시적인 오류가 발생했습니다. 네이버 톡톡으로 문의해 주세요.");
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}
