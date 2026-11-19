// SOMAFLOW Studio - Interactive Script

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Header Scroll Effect
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. Mobile Navigation Drawer
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerClose = document.querySelector('.drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  function openDrawer() {
    mobileDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
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
        if (window.lucide) window.lucide.createIcons();
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

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all others
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
          <strong>💡 체크 결과 (${selectedCount}개 해당):</strong>
          현재 신체 불균형 또는 운동 시작의 어려움을 겪고 계신다면,
          물리치료사 출신 대표 코치의 <strong>1:1 기능적 움직임 평가 및 최저 단계 맞춤 솔루션</strong>이 큰 도움이 됩니다.
        `;
      } else {
        resultAlert.style.display = 'none';
      }
    }
  }

  // 8. Consultation Form Submission Mockup
  const consultForm = document.getElementById('consult-form');
  if (consultForm) {
    consultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('client-name');
      const phoneInput = document.getElementById('client-phone');
      const name = nameInput ? nameInput.value : '';

      alert(`[소마플로우] ${name || '회원'}님의 상담 문의가 성공적으로 접수되었습니다.\n담당 코치가 확인 후 빠른 시간 내에 연락드리겠습니다.\n\n더 빠른 실시간 답변을 원하시면 상단의 [네이버 톡톡]을 이용해주세요.`);
      consultForm.reset();
    });
  }

  // 9. Smooth Scroll Active Nav Spy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
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
});
