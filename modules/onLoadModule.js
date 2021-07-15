/* Copyright by Claudio De Angelis, ReCreateIdeas 2018
The use of this code is free and open to any third party.
It is not nevertheless not authorized the reproduction in any case whatsoev..

JUST KIDDING!! do whatever you want  I hope it's useful.
*/

// This module injects the css and scripts tags as well as attaching all thge event listeners
const onLoadModule = (() => {
    let keyDown = false;
    const container = document.createElement('div');
    container.id = 'finderUIdiv';
    const modal = document.createElement('iframe');
    modal.id = 'finderUIWrapper';
    modal.name = 'finderUIWrapper';
    modal.role = 'dialog';
    modal.style = 'display:none;';
    modal.src = chrome_extension + '/html/iframe.html';
    const my_css = document.createElement('link');
    my_css.id = 'smallstyle';
    my_css.rel = 'stylesheet';
    my_css.type = 'text/css';
    my_css.href = chrome_extension + '/css/recreate_smallstyle.css';
    const load_tags = () => {
        document.getElementsByTagName('head')[0].appendChild(my_css);
        document.getElementsByTagName('body')[0].appendChild(modal);

        $(document).ready(e => {
            $('*').keydown(e => {
                if (e.which == 18) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    keyDown = true;
                }
            });
            $('*').keyup(e => {
                if (e.which == 18) {
                    keyDown = false;
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    // $('*').removeClass('hova_recreate_border');
                }
            });

            $('*')
                .not('#finderUIWrapper')
                .on('mouseover', e => {
                    if (keyDown == true) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        $(e.target).addClass('hova_recreate_border');
                    }
                })
                .on('mouseout', e => {
                    $(e.target).removeClass('hova_recreate_border');
                });

            $('*').on('click', e => {
                if (keyDown == true) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    // keyDown = false;
                    compileDataModule.initialize(e.target, e);
                }
            });
            console.log('...Selector Finder is running...');
        });
    };

    sessionStorage.setItem('navigation_counter', 0);

    return {
        initialize: load_tags
    };
})();

onLoadModule.initialize();
