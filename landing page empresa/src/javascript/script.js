$(document).ready(function(){
    $('#mobile_btn').on('click', function(){
        $('#mobile_menu').toggleClass('active');
        $('#mobile_btn').find('i').toggleClass('fa-x');
    });

    const sections = $('section');
    const navItems = $('.nav-item');

    $(window).on('scroll', function(){
        const header = $('header');
        let activeSectionIndex = 0;
        const scrollPosition = $(window).scrollTop() - header.outerHeight();

        if (scrollPosition <= 0){
            header.css('box-shadow', 'none');
        } else {
            header.css('box-shadow', '5px 1px 5px rgba(0, 0, 0, 0.1)');
        }

        sections.each(function(i){
            const section = $(this);
            const sectionTop = section.offset().top - 96;
            const sectionBottom = sectionTop + section.outerHeight();

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom){
                activeSectionIndex = i;
                return false;
            }
        });

        navItems.removeClass('active');
        $(navItems[activeSectionIndex]).addClass('active');
    });

    // Animação Seção CTA
    ScrollReveal().reveal('#cta', {
        origin: 'left', 
        duration: 2000,
        distance: '20%',
    });

    // Animação antigos produtos (cosméticos)
    ScrollReveal().reveal('.cosmetico', {
        origin: 'bottom', 
        duration: 2000,
        distance: '20%',
        interval: 100
    });

    // Animação imagem depoimentos
    ScrollReveal().reveal('#testimonials_foto', {
        origin: 'left', 
        duration: 1000,
        distance: '20%',
    });

    // Animação feedbacks
    ScrollReveal().reveal('.feedback', {
        origin: 'right', 
        duration: 2000,
        distance: '10%',
        interval: 100
    });

    // ✅ NOVO — animação dos benefícios
    ScrollReveal().reveal('.benefit', {
        origin: 'bottom', 
        duration: 1800,
        distance: '25%',
        interval: 150,
        easing: 'ease-in-out'
    });
});
