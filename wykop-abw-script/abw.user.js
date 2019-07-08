// ==UserScript==
// @name ABW Przycisk
// @namespace abw_przycisk
// @description Przycisk do ABW
// @include http://*.wykop.pl/*
// @version 3.3.1
// @downloadURL https://ginden.pl/scripts/abw.user.js
// @license CC BY-SA 3.0
// ==/UserScript==
var load$UI = document.createElement('script');
load$UI.setAttribute('src',
    'http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.js');
load$UI.setAttribute('id', 'jquery-ui');
document.body.appendChild(load$UI);
var fix_fucked_JSON = document.createElement('script');
fix_fucked_JSON.innerHTML = '(' + (function (global) {
        global.JSON.parse = (function (old) {
            return (function parse() {
                    var args = Array.prototype.slice.call(
                        arguments, 0);
                    if (args[0].indexOf('for(;;);') === 0) {
                        args[0] = args[0].slice(8);
                    }
                    return old.apply(JSON, args);
                })
                .bind(global.JSON)
        })(global.JSON.parse);
    })
    .toString() + ')(window)';
// MACIEJ
// ZABIJ SIĘ
document.body.appendChild(fix_fucked_JSON);

function main() {
    function fullBind(func, thisArg, args) {
        return Function.prototype.bind.apply(func, [thisArg].concat(args));
    }

    function waitUntil$UI(func) {
        var bindedFunction;
        var i = 0;
        return function waitingFunction() {
            bindedFunction = bindedFunction || fullBind(func, this,
                arguments);
            if (retrieveFromWindow('$', 'ui')) {
                bindedFunction();
            } else {
                if (document.querySelector('script#jquery-ui')) {
                    document.querySelector('script#jquery-ui')
                        .addEventListener('load', bindedFunction)
                } else {
                    setTimeout(waitingFunction, i += 10);
                }
            }
	    return false;
        }
    }

    function retrieveFromWindow(propName) {
        if (arguments.length === 1) {
            return window[propName];
        }
        var currEl = window;
        var args = Array.prototype.slice.call(arguments, 0);
        while (args.length && currEl !== void 0) {
            currEl = currEl[args.shift()];
        }
        return currEl;
    }
    var Wykop = {
        currentAction: retrieveFromWindow('wykop', 'params', 'action'),
        token: retrieveFromWindow('wykop', 'params', 'hash'),
        getCurrentUser: function () {
            if (this._user) {
                return this._user;
            }
            var ret = {};
            var currUserDOM = $('.logged-user a.ellipsis')
                .first();
            try {
                ret.color = (function (UserNode) {
                    var link = UserNode;
                    console.log(link);
                    var lista_klas = link.attr('class')
                        .split(/\s+/);
                    var kolor = lista_klas.filter(function (
                        el) {
                        if (el.match('color-')) {
                            return true;
                        }
                        return false;
                    });
                    return (kolor[0].replace('color-', ''));
                })(currUserDOM);
                ret.name = $.trim(currUserDOM.text());
            } catch (e) {
                console.warn(e.toString());
                ret = {
                    'name': null,
                    'color': 0
                }
            }
            ret.getLastEntry = function () {
                var ret = $.ajax({
                    method: 'GET',
                    url: '/ludzie/wpisy/' + this.name +
                        '/'
                });
                ret.done(function (html) {

                    try {
                        var ret = {
                            name: 'LastEntry'
                        };
                        var entries = $(
                            '#itemsStream li', html
                        );
                        var firstEntry = entries.first();
                        var entryId = firstEntry.find('.ownComment:first')
                            .attr(
                                'data-id');
                        var nodeText = firstEntry.text();
                        ret.id = entryId;
                        ret.text = nodeText;
                    } catch (e) {
                        alert(e)
                    }
                    console.log(ret);
                    Wykop.getCurrentUser()
                        .lastEntry = ret;

                    return ret;
                });

                return ret;
            };
            return (this._user = ret);
        },
        getEntryAddURL: function (channel) {
            var ret = 'http://www.wykop.pl/ajax2/wpis/dodaj/hash/' +
                this.token + '/';
            if (channel) {
                ret += 'channel/' + channel + '/';
            }
            return ret;
        },
        addEntry: function (message, channel) {
            var url = this.getEntryAddURL(channel);
            return $.ajax(
                url, {
                    type: 'POST',
                    data: {
                        '__token': this.token,
                        'body': message
                    }
                }
            )
        },
        commentEntry: function (message, entryId) {
            console.log(arguments);
            return $.ajax({
                url: 'http://www.wykop.pl/ajax2/wpis/CommentAdd/' +
                    entryId + '/hash/' + this.token + '/',
                type: 'POST',
                data: {
                    '__token': this.token,
                    'body': message
                }
            });
        }
    }


    var UI = {
        alert: function (message, title) {
            $("<div />")
                .dialog({
                    buttons: {
                        "Ok": function () {
                            $(this)
                                .dialog("close");
                        }
                    },
                    close: function (event, ui) {
                        $(this)
                            .remove();
                    },
                    resizable: false,
                    title: title,
                    modal: true
                })
                .text(message);
        }
    }

    var GROUP = {
        ID: 'agencjabezpieczenstwawykopu',
        retrieveUsersList: function () {
            return $.ajax(
                    'http://wykop.koziolek.biz/spamlista/abw/', {
                        dataType: 'jsonp',
                    })
                .success(function (data) {
                    GROUP.usersList = data;
                });
        },
        getURL: function () {
            return 'http://www.wykop.pl/mikroblog/kanal/' + this.ID +
                '/';
        }
    }
    var MESSAGES = {
        FIRST_SUCCESS: 'Request wys\u0142any poprawnie.',
        SPAM_LIST_HEADER: [
            '[Spamlista](http://ginden.pl/scripts/abw.html)',
            '([wypisz/zapisz się](http://www.wykop.pl/dodatki/pokaz/267/))',
            '[dodatek Gindena](http://ginden.pl/scripts/abw.html#przycisk)'
        ].join(' '),
        TOTAL_SUCCES: 'Wszystko wys\u0142ane poprawnie!',
        GROUP_MESSAGE_HEADER: '**PRZYCZYNA**'
    }
    $.extend(UI);

    function NavIcon(url, id) {
        var contDiv = $('<li />')
            .attr('id', id);
        var icon = $('<a />')
            .attr('href', url);
        return contDiv.append(icon);
    }

    function chunkArray(arr, size) {
        var chunks = [];
        while (arr.length > 0) {
            chunks.push(arr.splice(0, size));
        }
        return chunks;
    }

    function markdownLink(URL, desc) {
        return ['[', desc, '](', URL, ')'].join('');
    }

    function ReportDialog(text) {
        var ret = $('<div />');
        ret.attr({
            id: 'dialog-zglosfest',
            title: 'ABW'
        });
        ret.append(
            $('<textarea />')
            .attr('id', 'report-comment')
            .val(text)
        );
        return ret;
    }

    function addGroupEntry(message, channel, spamlista) {
        Wykop.addEntry(message, channel)
            .done(function () {
                if (channel && spamlista) {
                    Wykop.getCurrentUser()
                        .getLastEntry()
                        .done(
                            function () {
                                var lastEntry = Wykop.getCurrentUser()
                                    .lastEntry;
                                console.log(lastEntry)
                                GROUP.retrieveUsersList()
                                    .done(function (usersList) {
                                        var howManyUsers = (
                                            function (
                                                number) {
                                                number =
                                                    number +
                                                    1;
                                                return 10 *
                                                    (Math.pow(
                                                            number,
                                                            2
                                                        ) -
                                                        2 *
                                                        number +
                                                        2);
                                            })(Number(Wykop
                                            .getCurrentUser()
                                            .color));

                                        var chunks = chunkArray(
                                            usersList.map(
                                                function (
                                                    el) {
                                                    return '@' + el;
                                                }),
                                            howManyUsers);
					var time = 50;
                                        var prepareMessage =
                                            function (message, id) {
						console.log(['Kolejkuję jakiegoś ajaxa.', arguments]);
                                                Wykop.commentEntry(
                                                        message,
                                                        id
                                                );
                                            };
                                        console.log([usersList, chunks, howManyUsers]);
                                        var commentsChain =
                                            Wykop.commentEntry(
                                                MESSAGES.SPAM_LIST_HEADER +
                                                '\n' + chunks.shift()
                                                .join(' '),
                                                lastEntry.id);
					    var currEl;
                                        while (currEl = chunks.shift()) {
                                                prepareMessage(
                                                    currEl.join(' '),
							lastEntry.id
						);
                                        }
                                        commentsChain.done(function () {
                                            $.alert(MESSAGES.TOTAL_SUCCES);
                                        })
                                    });

                            });
                }
            });
    }

    function ABW_report() {
        var title = $(this)
            .data('title');
        var URL = $(this)
            .data('id');
        var tekst = MESSAGES.GROUP_MESSAGE_HEADER + '\n' + markdownLink(
            URL, title) + '\n';
        var reportDialog = new ReportDialog(tekst);
        $(document.body)
            .append(reportDialog);
        reportDialog
            .dialog({
                create: function (event, ui) {
                    $('textarea', this)
                        .val(tekst.replace('\u2022', ''));
                },
                autoOpen: true,
                resizable: false,
                height: 500,
                width: 800,
                modal: true,
                buttons: {
                    "zg\u0142o\u015B": function () {
                        var reportText = $('textarea', this)
                            .val();
                        addGroupEntry(reportText, GROUP.ID,
                            true);
                        $(this)
                            .dialog("close");
                        reportDialog.empty()
                            .remove();
                    },
                    "zg\u0142o\u015B bez spamlisty": function () {
                        var reportText = $('textarea', this)
                            .val();
                        addGroupEntry(reportText, GROUP.ID,
                            false);
                        $(this)
                            .dialog("close");
                        reportDialog.empty()
                            .remove();
                    },

                    "publicznie": function () {
                        var reportText = $('textarea', this)
                            .val();
                        addGroupEntry(reportText, false, false);
                        $(this)
                            .dialog("close");
                        reportDialog.empty()
                            .remove();
                    },
                    "Anuluj": function () {
                        $(this)
                            .dialog("close");
                        reportDialog.empty()
                            .remove();
                    }
                },
                close: function (event, ui) {
                    reportDialog.empty()
                        .remove();
                }
            });
        return false;
    }
    try {

        (function mainFunc() {
            var $UI_theme = $('<link/>')
                .attr('rel', 'stylesheet')
                .attr('type', 'text/css');
            if (retrieveFromWindow('nightmode')) {
                $UI_theme.attr('href',
                    'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/themes/dark-hive/jquery-ui.css'
                );
            } else {
                $UI_theme.attr('href',
                    'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/themes/smoothness/jquery-ui.css'
                );
            }
            $(document.head)
                .append($UI_theme);

            var HASH = '03e58bfe41a357529d95ca1bc1f5d458';

            function getBoolConfiguration(name, def) {
                var ret = localStorage[HASH + '_' + name];
                if (ret === undefined) {
                    return setBoolConfiguration(name, def);
                }
                return !!JSON.parse(ret);
            }

            function setBoolConfiguration(name, val) {
                console.log('I set CONF.' + name + ' = ' + !!val)
                return localStorage[HASH + '_' + name] = !!val;

            }
            var CONFIGURATION = {
                ICON: getBoolConfiguration('ICON', true),
                BUTTONS: getBoolConfiguration('BUTTONS', true),
                NAV: getBoolConfiguration('NAV', false)
            };
            $(document.head)
                .append(
                    //
                    $('<style />')
                    .html(
                        [
                            "#abw_grupa a{",
                            "background-image:url('http://wykop.ginden.pl/abw/aCuKTnV.php') !important;",
                            "background-repeat:no-repeat;",
                            "background-position: center;",
                            'background-size: 100% auto;',
                            "}",
                            "#abw_grupa:hover a { ",
                            "background-image: url('http://i.imgur.com/ghRv6kv.png') !important;",
                            "background-repeat:no-repeat !important;",
                            "}",
                            ".abw_button {",
                            "color: red !important;",
                            "}",
                            '.abw_button i {',
                            'opacity: .3',
                            '}',
                            '#report-comment {width:100%; height: 100%}',
                            "div.raport_abw:hover{opacity:1}"
                        ].join('\n')
                    ));

            function ReportButton(title, URL) {
                URL = URL || (retrieveFromWindow('location',
                    'origin') + retrieveFromWindow(
                    'location', 'pathname'));
                var ret = $('<a />')
                    .attr('class', 'button abw_button')
                    .data('id', URL)
                    .data('title', title)
                    .attr('href', '#')
                    .append($('<i class="fa fa-flag" />'))
                    .click(waitUntil$UI(ABW_report));
                return ret;
            }

            function createInputsFromConfig(conf) {
                var ret = $('<form />');
                var inputs = [
                    ['Ikona ABW', 'ICON'],
                    ['Przyciski zgłaszania', 'BUTTONS'],
                    ['Link na belce', 'NAV']
                ];
                var row;
                var table = $('<table />');
                for (var i = 0; i < inputs.length; i++) {
                    row = $('<tr/>');
                    row.append(
                        $('<td />')
                        .append(
                            inputs[i][0]
                        ),
                        $('<td />')
                        .append(
                            $('<input type="checkbox" name="' +
                                inputs[i][1] + '">')
                            .prop('checked', conf[inputs[i][1]])
                        )
                    )
                    table.append(row);
                }
                ret.append(table);
                return ret;
            }

            function setConfigFromForm($form) {
                var source = $('input', $form);
                console.log(source);
                source.each(function (index) {
                    $this = $(this);
                    setBoolConfiguration($this.attr('name'),
                        $this.prop('checked'));
                });
            }

            function ConfigPanel() {

                var dialog = $('<div />');
                $(document.body)
                    .append(dialog);
                dialog.css('display', 'none')
                dialog.append(
                    createInputsFromConfig(CONFIGURATION)
                );
                dialog.dialog({
                    autoOpen: false,
                    height: 300,
                    width: 350,
                    modal: true,
                    buttons: {
                        'zapisz i zamknij': function () {
                            dialog.dialog('close');

                        }
                    },
                    close: function () {
                        setConfigFromForm($('form',
                            dialog));
                        dialog.css('display', 'none')
                    }
                });
                return function () {
                    dialog.css('display', 'block');
                    dialog.dialog('open');
                }

            }

            function ConfigButton($where) {
		var $container = $where.clone();
		var $button = $container.children('a');
                $button.attr({
                    href: '#'
                });
                $button.children('span').text('abw');
                $button.on('click', new ConfigPanel());
                $where.after($container);


            }
            if (Wykop.currentAction === 'settings') {
                waitUntil$UI(function waitTilUi() {
                    if ($.ui) {
                        new ConfigButton($('a[href="http://www.wykop.pl/ustawienia/czarne-listy/"]').parent())
                        return;
                    }
                })();
            }
            if (CONFIGURATION.ICON) {
                $('#nav ul.clearfix .m-user').first().before(new NavIcon(GROUP.getURL(), 'abw_grupa'));
            }
            if (CONFIGURATION.NAV) {
                var toAdd = $('<li />').append(
		$('<a>')
                    .attr({
                        'class': 'tip fleft cfff tab fbold',
                        'title': 'Agencja Bezpieczeństwa Wykopu',
                        'href': GROUP.getURL()
                    })
                    .text('ABW')
		);
                if (document.URL === GROUP.getURL()) {
                    toAdd.addClass('active');
                }
                $('#nav .mainnav')
                    .append(toAdd);
                toAdd = null;
            }
            if (CONFIGURATION.BUTTONS) {
                var reportButton;
                if (Wykop.currentAction === 'index' || Wykop.currentAction ===
                    'upcoming') {
                    var LinksList = $('#itemsStream li');
                    $.each(LinksList, function (id, element) {
                        var title = $('h2', element)
                            .text()
                            .trim();
                        var URL = $('.fa-comments-o', element)
                            .parent()
                            .attr('href');

                        if ($('.diggbox')
                            .text()
                            .match(/wykop|cofnij/)) {
                            $('.diggbox', element)
                                .append(new ReportButton(
                                    title, URL));
                        }

                    });
                } else if (Wykop.currentAction === 'link') {
                    reportButton = new ReportButton($('h2')
                        .text()
                        .trim());
                    $('.diggbox')
                        .append(reportButton);
                } else if (Wykop.currentAction === 'profile') {
                    reportButton = new ReportButton($('.user-profile')
                        .attr('data-id')
                        .trim())
                    $('.user-profile .m-reset-position .button')
                        .parent()
                        .append(reportButton);
                } else if (false && Wykop.currentAction === 'entries') {
                    reportButton =  new ReportButton($('.userstory h2')
                        .text()
                        .trim())
                    $('.userstory h2')
                        .before(reportButton);
                }
            }
        })();
    } catch (e) {
        alert(e);
    }
}

function addJQuery(callback) {
        "use strict";
        var script = document.createElement("script");
        script.textContent = "(" + callback.toString() + ")();";
        document.body.appendChild(script);
    }
    //if (typeof $ === typeof undefined) {
    //  if (unsafeWindow.jQuery) {
    //      var $ = unsafeWindow.jQuery;
    //       main();
    //   } else {
addJQuery(main);
//  }
//} else {
//  main();
//}
