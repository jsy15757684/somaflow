// ============================================================================
// [소마플로우 운영자 설정] 1:1 방문 상담 신청 — 구글 스프레드시트 & 이메일 실시간 알림 연동
// ----------------------------------------------------------------------------
// 구글 스프레드시트(Apps Script)에서 발급받은 [웹 앱 URL]을 아래 큰따옴표 안에 붙여넣으세요.
// (자세한 3분 설정법은 프로젝트 내 google_apps_script.js 또는 PDF 운영가이드를 참고하세요)
// 예시: const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx.../exec";
// ============================================================================
const GOOGLE_SCRIPT_URL = "";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initSomaflow() {
  if (window.__somaflowInitialized) return;
  window.__somaflowInitialized = true;

  // 1. Initialize Icons
  if (window.lucide) {
    try {
      window.lucide.createIcons();
    } catch (err) {
      console.warn('Lucide icon init skipped:', err);
    }
  }

  // 2. Header Scroll Effect
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 3. Mobile Navigation Drawer
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerClose = document.querySelector('.drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (mobileDrawer) {
    mobileDrawer.addEventListener('click', (e) => {
      if (e.target === mobileDrawer) closeDrawer();
    });
  }
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // 4. Program Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.program-card-detail');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
        if (window.lucide) {
          try { window.lucide.createIcons(); } catch (_) {}
        }
      }
    });
  });

  // 5. Facility Lightbox Modal
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modalOverlay = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('modal-img');
  const modalCaption = document.getElementById('modal-caption');
  const modalClose = document.getElementById('modal-close');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-caption');
      if (img && modalOverlay && modalImg) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || '소마플로우 시설 전경';
        if (modalCaption && caption) {
          modalCaption.textContent = caption.textContent;
        }
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // 6. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        faqItems.forEach(otherItem => {
          otherItem.classList.remove('active');
          const otherAns = otherItem.querySelector('.faq-answer');
          if (otherAns) otherAns.style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  // Open first FAQ by default
  if (faqItems.length > 0) {
    const firstItem = faqItems[0];
    const firstAns = firstItem.querySelector('.faq-answer');
    firstItem.classList.add('active');
    if (firstAns) firstAns.style.maxHeight = firstAns.scrollHeight + 'px';
  }

  // 7. Interactive Self-Checklist
  const checkItems = document.querySelectorAll('.check-item');
  const resultAlert = document.getElementById('check-result');

  checkItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('selected');
      updateCheckResult();
    });
  });

  function updateCheckResult() {
    const selectedCount = document.querySelectorAll('.check-item.selected').length;
    if (resultAlert) {
      if (selectedCount > 0) {
        resultAlert.style.display = 'block';
        resultAlert.innerHTML = `
          <strong>💡 체크 결과 (${selectedCount}개 항목 해당):</strong><br>
          현재 신체 불균형 또는 운동 시작의 어려움을 겪고 계신다면,
          물리치료사 출신 대표 코치의 <strong>1:1 기능적 움직임 평가 및 최저 단계(Level 0) 맞춤 솔루션</strong>을 추천합니다.
        `;
      } else {
        resultAlert.style.display = 'none';
      }
    }
  }

  // 8. Consultation Form Submission (Google Sheets + Email Real-time Notification)
  const consultForm = document.getElementById('consult-form');
  const consultFeedback = document.getElementById('consult-feedback');
  const submitBtn = document.getElementById('consult-submit-btn');

  if (consultForm) {
    consultForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('client-name');
      const phoneInput = document.getElementById('client-phone');
      const interestInput = document.getElementById('client-interest');
      const timeInput = document.getElementById('client-time');
      const msgInput = document.getElementById('client-message');
      const websiteInput = document.getElementById('client-website');
      const consentInput = document.getElementById('client-consent');

      if (consentInput && !consentInput.checked) {
        alert('개인정보 수집·이용에 동의해 주셔야 상담 신청이 가능합니다.');
        consentInput.focus();
        return;
      }

      const payload = {
        name: nameInput ? nameInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        interest: interestInput ? interestInput.value : '',
        time: timeInput ? timeInput.value : '',
        message: msgInput ? msgInput.value.trim() : '',
        website: websiteInput ? websiteInput.value : '',
        consent: consentInput ? consentInput.checked : false
      };
      const safeName = escapeHtml(payload.name);
      const safePhone = escapeHtml(payload.phone);

      const originalBtnText = submitBtn ? submitBtn.innerHTML : '1:1 방문 상담 신청하기';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '상담 신청 접수 중...';
      }

      try {
        if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.startsWith('https://script.google.com/')) {
          // 구글 스프레드시트 자동 저장 + 운영자 이메일 실시간 알림 전송
          await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
          });

          if (consultFeedback) {
            consultFeedback.style.display = 'block';
            consultFeedback.innerHTML = `
              <div style="background: #FBF7EC; border: 1px solid #C9A84C; border-radius: 10px; padding: 18px 20px; margin-top: 16px; color: #2B2724; font-size: 13.5px; line-height: 1.7;">
                <strong style="color: #A8862B; font-size: 14.5px;">✓ ${safeName}님의 1:1 방문 상담 신청이 정상 접수되었습니다.</strong><br>
                담당 대표 코치에게 실시간 알림이 전송되었으며, 남겨주신 연락처(<strong>${safePhone}</strong>)로 빠르게 안내 연락드리겠습니다.
              </div>
            `;
          } else {
            alert(`[소마플로우] ${payload.name}님의 1:1 방문 상담 신청이 정상 접수되었습니다.\n남겨주신 연락처(${payload.phone})로 빠르게 연락드리겠습니다.`);
          }
          consultForm.reset();
        } else {
          // GOOGLE_SCRIPT_URL 미설정 시: 클립보드 복사 + 안내 박스 표시
          const summary = `[소마플로우 1:1 상담 신청]\n- 성함: ${payload.name}\n- 연락처: ${payload.phone}\n- 관심 프로그램: ${payload.interest}\n- 희망 시간대: ${payload.time}\n- 문의내용: ${payload.message || '없음'}`;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(summary).catch(() => {});
          }

          if (consultFeedback) {
            consultFeedback.style.display = 'block';
            consultFeedback.innerHTML = `
              <div style="background: #FBF7EC; border: 1px solid #C9A84C; border-radius: 10px; padding: 18px 20px; margin-top: 16px; color: #2B2724; font-size: 13.5px; line-height: 1.7;">
                <strong style="color: #A8862B; font-size: 14.5px;">✓ 작성하신 상담 신청 내용이 복사되었습니다.</strong><br>
                아래 버튼을 눌러 네이버 톡톡 상담창에 붙여넣기(Ctrl+V) 해 주시면 대표 코치가 즉시 확인합니다.<br>
                <a href="https://talk.naver.com/ct/ws6eq0p?frm=mnmb&frm=nmb_detail#nafullscreen" target="_blank" rel="noopener noreferrer" class="btn btn-ink btn-sm" style="margin-top: 10px;">
                  네이버 톡톡 상담창 열기 ›
                </a>
                <p style="font-size: 11.5px; color: #A39A86; margin-top: 10px;">
                  * 운영자 안내: <code>js/main.js</code> 상단의 <code>GOOGLE_SCRIPT_URL</code>에 구글 시트 웹앱 주소를 입력하시면 톡톡 이동 없이 구글 스프레드시트 저장 및 이메일 실시간 알림이 자동 작동합니다.
                </p>
              </div>
            `;
          }
          consultForm.reset();
        }
      } catch (err) {
        alert('일시적인 네트워크 오류가 발생했습니다. 상단의 [네이버 톡톡] 버튼을 이용해 문의해 주세요.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  // 9. Smooth Scroll Active Nav Spy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 130;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSomaflow);
} else {
  initSomaflow();
}
