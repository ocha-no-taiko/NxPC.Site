$(function()
{
    if (window.NXPC_LIVE) {
        var now = new Date();
        var start = new Date(window.NXPC_LIVE.start);
        var end = new Date(window.NXPC_LIVE.end);
        if (now >= start && now <= end) {
            $('.youtubeIcon').css('display', '');
        }
    }

    // タイトルロゴ(Lottieアニメーション)は廃止したため、
    // 以前はロゴの再生完了をトリガーにしていた本文表示を
    // 固定時間後に行うようにする。
    $('.ready').addClass('fadeIn');

    setTimeout(function() {
        $('.innerarea').removeClass('d-none');
        $(window).trigger('scroll');
        $('.ready').removeClass('blink');
        $('.ready').addClass('fadeOut');
        $('.ready').addClass('d-none');
        setTimeout(function() {
            $('.scroll').addClass('fadeIn');
        }, 1500);
    }, 1800);

    $(window).on('scroll', function()
    {
        var innerarea = $('#main .innerarea')[0];
        var top = 0;
        var bottom = 0;
        var wh = $(window).height();

        if (innerarea && !$('.innerarea').hasClass('d-none')) {
            var rect = innerarea.getBoundingClientRect();
            top = rect.top;
            bottom = rect.bottom;
        }

        $('.video').has('.pc_only').each(function()
        {
            var $this = $(this);

            if(innerarea && !$('.innerarea').hasClass('d-none') && bottom > 0 && top < wh){

                if ($this.hasClass('prev')) {
                    $this.removeClass('fadeIn');
                    $this.addClass('fadeOut');
                    $('.scroll').removeClass('fadeIn');
                    $('.scroll').addClass('fadeOut');
                }
                else if ($this.hasClass('next')) {
                    $this.removeClass('fadeOut');
                    $this.addClass('fadeIn');
                }

            }
            else {

                if ($this.hasClass('prev')) {
                    $this.removeClass('fadeOut');
                    $this.addClass('fadeIn');
                    if (!$('.innerarea').hasClass('d-none')) {
                        $('.scroll').removeClass('fadeOut');
                        $('.scroll').addClass('fadeIn');
                    }
                }
                else if ($this.hasClass('next')) {
                    $this.removeClass('fadeIn');
                    $this.addClass('fadeOut');
                }
            }

        });

    });


});
