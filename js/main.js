// SOMAFLOW Studio - Interactive Script

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

  // 8. Consultation Form Submission
  const consultForm = document.getElementById('consult-form');
  if (consultForm) {
    consultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('client-name');
      const phoneInput = document.getElementById('client-phone');
      const interestInput = document.getElementById('client-interest');
      const timeInput = document.getElementById('client-time');
      const msgInput = document.getElementById('client-message');

      const name = nameInput ? nameInput.value : '';
      const phone = phoneInput ? phoneInput.value : '';
      const interest = interestInput ? interestInput.value : '';
      const time = timeInput ? timeInput.value : '';
      const msg = msgInput ? msgInput.value : '';

      const summary = `[소마플로우 1:1 상담 신청]\n- 성함: ${name}\n- 연락처: ${phone}\n- 관심 프로그램: ${interest}\n- 희망 시간대: ${time}\n- 문의내용: ${msg || '없음'}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(summary).catch(() => {});
      }

      const goTalk = confirm(
        `[소마플로우] ${name || '회원'}님의 상담 신청 내역이 클립보드에 복사되었습니다.\n\n실시간 예약 확정을 위해 네이버 톡톡 상담창으로 바로 이동하시겠습니까?\n(톡톡 창에 붙여넣기 하시면 바로 전달됩니다)`
      );
      if (goTalk) {
        window.open('https://talk.naver.com/ct/ws6eq0p?frm=mnmb&frm=nmb_detail#nafullscreen', '_blank');
      }
      consultForm.reset();
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
