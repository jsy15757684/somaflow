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
 */

// ★ 알림 메일을 받을 운영자 이메일 주소를 입력하세요 (비워두면 구글 시트 소유자 이메일로 발송됩니다)
const NOTIFY_EMAIL = ""; 

function doPost(e) {
  try {
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

    // 전송된 데이터 파싱 (JSON 또는 Form Data 모두 지원)
    let data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (_) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    const timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    const name = data.name || "(미입력)";
    const phone = data.phone || "(미입력)";
    const interest = data.interest || "(미선택)";
    const time = data.time || "(미선택)";
    const message = data.message || "-";

    // 1. 구글 스프레드시트에 새로운 행 추가
    sheet.appendRow([
      timestamp,
      name,
      phone,
      interest,
      time,
      message,
      "신규 접수"
    ]);

    // 2. 운영자 이메일로 실시간 알림 발송
    const recipient = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
    if (recipient) {
      const subject = `[소마플로우 상담신청] ${name}님 (${phone}) 1:1 방문 상담이 접수되었습니다.`;
      const htmlBody = `
        <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 560px; padding: 24px; border: 1px solid #E6DECE; border-radius: 12px; background: #FCFBF8; color: #2B2724;">
          <p style="font-size: 11px; letter-spacing: 0.2em; color: #A8862B; font-weight: bold; margin: 0 0 8px;">SOMAFLOW PT STUDIO</p>
          <h2 style="margin: 0 0 18px; font-size: 20px; color: #2B2724;">신규 1:1 방문 상담 신청 내역</h2>
          <table style="width: 100%; border-collapse: collapse; background: #FFFFFF; border: 1px solid #E6DECE; border-radius: 8px;">
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6; font-weight: bold; width: 130px; color: #7A7168;">접수 일시</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6;">${timestamp}</td>
            </tr>
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6; font-weight: bold; color: #7A7168;">성함</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6;"><strong>${name}</strong></td>
            </tr>
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6; font-weight: bold; color: #7A7168;">연락처</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6;"><a href="tel:${phone}" style="color: #A8862B; font-weight: bold; text-decoration: none;">${phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6; font-weight: bold; color: #7A7168;">관심 프로그램</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6;">${interest}</td>
            </tr>
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6; font-weight: bold; color: #7A7168;">희망 시간대</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #EFE8D6;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 12px 14px; font-weight: bold; color: #7A7168;">문의 및 고민부위</td>
              <td style="padding: 12px 14px; white-space: pre-wrap;">${message}</td>
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

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "상담 신청이 접수되었습니다." }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
