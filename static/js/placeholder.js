/*! http://mths.be/placeholder v2.1.1 by @mathias */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($) {

    // Opera Mini v7 doesn't support placeholder although its DOM seems to indicate so
    var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
    var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
    var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
    var valHooks = $.valHooks;
    var propHooks = $.propHooks;
    var hooks;
    var placeholder;

    if (isInputSupported && isTextareaSupported) {

        placeholder = $.fn.placeholder = function() {
            return this;
        };

        placeholder.input = placeholder.textarea = true;

    } else {

        var settings = {};

        placeholder = $.fn.placeholder = function(options) {

            var defaults = {customClass: 'placeholder'};
            settings = $.extend({}, defaults, options);

            var $this = this;
            $this
                .filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
                .not('.'+settings.customClass)
                .bind({
                    'focus.placeholder': clearPlaceholder,
                    'blur.placeholder': setPlaceholder
                })
                .data('placeholder-enabled', true)
                .trigger('blur.placeholder');
            return $this;
        };

        placeholder.input = isInputSupported;
        placeholder.textarea = isTextareaSupported;

        hooks = {
            'get': function(element) {
                var $element = $(element);

                var $passwordInput = $element.data('placeholder-password');
                if ($passwordInput) {
                    return $passwordInput[0].value;
                }

                return $element.data('placeholder-enabled') && $element.hasClass(settings.customClass) ? '' : element.value;
            },
            'set': function(element, value) {
                var $element = $(element);

                var $passwordInput = $element.data('placeholder-password');
                if ($passwordInput) {
                    return $passwordInput[0].value = value;
                }

                if (!$element.data('placeholder-enabled')) {
                    return element.value = value;
                }
                if (value === '') {
                    element.value = value;
                    // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
                    if (element != safeActiveElement()) {
                        // We can't use `triggerHandler` here because of dummy text/password inputs :(
                        setPlaceholder.call(element);
                    }
                } else if ($element.hasClass(settings.customClass)) {
                    clearPlaceholder.call(element, true, value) || (element.value = value);
                } else {
                    element.value = value;
                }
                // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
                return $element;
            }
        };

        if (!isInputSupported) {
            valHooks.input = hooks;
            propHooks.value = hooks;
        }
        if (!isTextareaSupported) {
            valHooks.textarea = hooks;
            propHooks.value = hooks;
        }

        $(function() {
            // Look for forms
            $(document).delegate('form', 'submit.placeholder', function() {
                // Clear the placeholder values so they don't get submitted
                var $inputs = $('.'+settings.customClass, this).each(clearPlaceholder);
                setTimeout(function() {
                    $inputs.each(setPlaceholder);
                }, 10);
            });
        });

        // Clear placeholder values upon page reload
        $(window).bind('beforeunload.placeholder', function() {
            $('.'+settings.customClass).each(function() {
                this.value = '';
            });
        });

    }

    function args(elem) {
        // Return an object of element attributes
        var newAttrs = {};
        var rinlinejQuery = /^jQuery\d+$/;
        $.each(elem.attributes, function(i, attr) {
            if (attr.specified && !rinlinejQuery.test(attr.name)) {
                newAttrs[attr.name] = attr.value;
            }
        });
        return newAttrs;
    }

    function clearPlaceholder(event, value) {
        var input = this;
        var $input = $(input);
        if (input.value == $input.attr('placeholder') && $input.hasClass(settings.customClass)) {
            if ($input.data('placeholder-password')) {
                $input = $input.hide().nextAll('input[type="password"]:first').show().attr('id', $input.removeAttr('id').data('placeholder-id'));
                // If `clearPlaceholder` was called from `$.valHooks.input.set`
                if (event === true) {
                    return $input[0].value = value;
                }
                $input.focus();
            } else {
                input.value = '';
                $input.removeClass(settings.customClass);
                input == safeActiveElement() && input.select();
            }
        }
    }

    function setPlaceholder() {
        var $replacement;
        var input = this;
        var $input = $(input);
        var id = this.id;
        if (input.value === '') {
            if (input.type === 'password') {
                if (!$input.data('placeholder-textinput')) {
                    try {
                        $replacement = $input.clone().attr({ 'type': 'text' });
                    } catch(e) {
                        $replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
                    }
                    $replacement
                        .removeAttr('name')
                        .data({
                            'placeholder-password': $input,
                            'placeholder-id': id
                        })
                        .bind('focus.placeholder', clearPlaceholder);
                    $input
                        .data({
                            'placeholder-textinput': $replacement,
                            'placeholder-id': id
                        })
                        .before($replacement);
                }
                $input = $input.removeAttr('id').hide().prevAll('input[type="text"]:first').attr('id', id).show();
                // Note: `$input[0] != input` now!
            }
            $input.addClass(settings.customClass);
            $input[0].value = $input.attr('placeholder');
        } else {
            $input.removeClass(settings.customClass);
        }
    }

    function safeActiveElement() {
        // Avoid IE9 `document.activeElement` of death
        // https://github.com/mathiasbynens/jquery-placeholder/pull/99
        try {
            return document.activeElement;
        } catch (exception) {}
    }

}));

var DESIRE_WORK = {
    package: {},       // 레이어팝업 패키지
    timeOutCache: {},  // 이벤트 중복실행 방지 timeout 체크
    dataCache: {},     // 자동완성 데이타 cache
    keyDown: {},       // 자동완성 keyDown 수집
    autoCompTimeout: undefined,

    // 희망 업종 레이어팝업 셋팅
    init : function(params) {
        var $ = jQuery;

        if (!params['flag']
            || !params['layerPopBtn'] || $(params['layerPopBtn']).length === 0
            || !params['layerPop'] || $(params['layerPop']).length === 0
            || !params['returnCode'] || $(params['returnCode']).length === 0
            || !params['returnKeyword'] || $(params['returnKeyword']).length === 0
            || !params['resultWrap'] || $(params['resultWrap']).length === 0
        ) {
            return;
        }

        DESIRE_WORK.package[params['flag']] = {};

        var package = DESIRE_WORK.package[params['flag']];
        package.layerPopBtn    = $(params['layerPopBtn']);
        package.layerPop       = $(params['layerPop']);
        package.returnCode     = $(params['returnCode']);
        package.returnKeyword  = $(params['returnKeyword']);
        package.autoComplete   = params['autoComplete'] ? params['autoComplete'] : {};
        package.options        = {
            'codeLimitCnt' : params['codeLimitCnt'] ? params['codeLimitCnt'] : 1,
            'keywordLimitCnt' : params['keywordLimitCnt'] ? params['keywordLimitCnt'] : 5
        };

        // input[type="checkbox"] UI 이벤트 처리
        package.layerPop.on('change.BoxUi', '.sri_check input[type="checkbox"]', function() {
            if($(this).prop('checked')){
                $(this).closest('label').addClass('check_on');
            } else {
                $(this).closest('label').removeClass('check_on');
            }
        });

        // input[name="bcode"] 클릭 이벤트 처리
        package.layerPop.find('input[name="bcode"]').on('change', function() {
            var $layerPop = package.layerPop;
            var $bcode = $(this);
            var $mcode = $layerPop.find('input[name="mcode"][data-mcode="' + $bcode.data('mcode') + '"]');
            var $resultList = $layerPop.find('.list_job_check ul');

            var $codeWrap = $bcode.closest('.sub_depth2').siblings('.sub_depth3');
            var $subCodeWarp = $codeWrap.find('.sub_code_' + $bcode.data('bcode'));

            if ($bcode.prop('checked')) {
                if (package['options']['codeLimitCnt'] === 1) {
                    $layerPop.find('input[name="bcode"]').not($bcode).prop('checked', false).closest('label').removeClass('check_on');
                    $layerPop.find('input[name="code"]').prop('checked', false).closest('label').removeClass('check_on');
                    $layerPop.find('.sub_depth3').hide();
                    $layerPop.find('.sub_depth3 .on').removeClass('on').hide();
                    $resultList.empty();
                } else {
                    if ($resultList.find('[data-bcode]').length >= package['options']['codeLimitCnt']) {
                        if ($resultList.find('[data-bcode]').length >= $layerPop.data('bcode_limit')) {
                            $bcode.prop('checked', false).closest('label').removeClass('check_on');
                            alert('최대 ' + package['options']['codeLimitCnt'] + ' 개까지 선택 가능합니다.');
                            return false;
                        }
                    }
                }

                if ($resultList.find('[data-bcode="' + $bcode.data('bcode') + '"]').length > 0) {
                    return false;
                }
                $subCodeWarp.addClass('on').show();

                $resultList.append(
                    $('<li>', {'class': 'item_check'}).append(
                        $('<div>', {'class': 'box_task_hover'}).append(
                            $('<span>', {'class': 'hope_jobs', 'data-bcode': $bcode.data('bcode')}).css('color', '#566feb').append(
                                $mcode.val() + '&nbsp;&gt;&nbsp;' + $bcode.val() + '&nbsp;',
                                $('<button>', {'type': 'button', 'class': 'btn_delete'}).html('<span class="blind">삭제</span>')
                            )
                        )
                    )
                );
            } else {
                $subCodeWarp.find('input:checked').prop('checked', false).closest('label').removeClass('check_on');
                $subCodeWarp.removeClass('on').hide();

                $resultList.find('[data-bcode="' + $bcode.data('bcode') + '"]').closest('li').remove();
            }

            $codeWrap.find('.second').removeClass('second');
            $codeWrap.find('.on').not(':first').addClass('second');

            if ($codeWrap.find('.on').length > 0) {
                $codeWrap.show();
            } else {
                $codeWrap.hide();
            }
        });

        // input[name="code"] 클릭 이벤트
        package.layerPop.find('input[name="code"]').on('change', function() {
            var $layerPop = package.layerPop;
            var $code = $(this);
            var $resultList = $layerPop.find('.list_job_check ul [data-bcode="' + $code.data('bcode') + '"]').closest('div');

            if ($code.prop('checked')) {
                // 여기 위에처럼 수정필요
                if ($resultList.find('[data-code]').length >= package['options']['keywordLimitCnt']) {
                    $code.prop('checked', false).closest('label').removeClass('check_on');
                    alert('희망 키워드는 최대 5개까지 선택 가능합니다.');
                    return false;
                }

                if ($resultList.find('[data-code="' + $code.data('code') + '"]').length > 0) {
                    return false;
                }

                $resultList.append(
                    $('<span>', {'class': 'hope_jobs hope_depth', 'data-code': $code.data('code')}).append(
                        $code.val() + '&nbsp;',
                        $('<button>', {'type': 'button', 'class': 'btn_delete'}).html('<span class="blind">삭제</span>')
                    )
                );
            } else {
                $resultList.find('[data-code="' + $code.data('code') + '"]').remove();
            }
        });

        // 삭제버튼 클릭 이벤트
        package.layerPop.on('click', '.list_job_check ul .btn_delete', function () {
            var $layerPop = package.layerPop;
            var $obj = $(this);
            var $target;
            if ($obj.closest('.hope_jobs').hasClass('hope_depth')) {
                $target = $layerPop.find('input[name="code"][data-code="' + $obj.closest('span').data('code') + '"]');
            } else {
                $target = $layerPop.find('input[name="bcode"][data-bcode="' + $obj.closest('span').data('bcode') + '"]');
            }
            $target.prop('checked', false);
            $target.trigger('change');
        });

        // 희망업종 레이어팝업 닫기, 취소버튼 이벤트
        package.layerPop.find('.btn_close').on('click', function() {
            var log_label = 'select-close';
            if ($(this).text() === '취소') {
                log_label = 'select-cancel'
            }
            DESIRE_WORK.closeLayerPop(package);
            setLogScript('business-type', log_label);
        });


        // 희망업종 레이어팝업 호출버튼 이벤트
        package.layerPopBtn.on('click', function(){
            if(package.layerPop.is(':visible')){
                DESIRE_WORK.closeLayerPop(package);
            } else {
                DESIRE_WORK.openLayerPop(package);
            }
        });


        //  희망업종 레이어팝업 완료버튼 이벤트
        package.layerPop.find('.btn_save').on('click', function() {
            var $layerPop = package.layerPop;
            var $resultList = $layerPop.find('.list_job_check ul');
            var $bcodeList = $('input[name="industry_code"]');
            var $codeList = $('input[name="industry_keyword"]');

            if ($resultList.find('[data-bcode]').length === 0) {
                alert('업종을 하나이상 선택해 주세요.');
                return false;
            }

            if ($resultList.find('[data-code]').length === 0) {
                alert('키워드를 하나이상 선택해 주세요.');
                return false;
            }

            var bcodeList = [];
            var codeList = [];
            var industryBcodeHtml = '';
            var industryCodeHtml = '';

            $resultList.find('[data-bcode]').each(function () {
                var bcode = $(this).data('bcode');
                bcodeList.push(bcode);
                industryBcodeHtml += '<div class="industry-code-' + bcode + ' code-area" style="margin-top:10px">'
                    + '<div class="code-text" data-bcode="' + bcode + '">' + $(this).text().replace('삭제' ,'') + ' &gt; </div>'
                    + '<button type="button" class="cate_txt_delete" onclick="DESIRE_WORK.deleteDesire(this)"><span class="blind">삭제</span></button>'
                    + '</div>'
                ;
            });

            $resultList.find('[data-code]').each(function () {
                var code = $(this).data('code');
                codeList.push(code);
                industryCodeHtml += '<span class="industry-keyword-' + code + '" data-code="' + code + '">'
                    + $(this).text().replace('삭제' ,'') + '</span>';
            });

            var industryHtml = industryBcodeHtml +
                    '<div class="keyword pt7" style="">' + industryCodeHtml + '</div>'
            ;

            $('#industry_selected_area').html(industryHtml).show();

            if ($('#industry_category').hasClass('invalid')) {
                $('#industry_category').removeClass('invalid');
            }

            $bcodeList.val(bcodeList.join('|'));
            $codeList.val(codeList.join('|'));

            $('button[name="btn_desire_industry"]').text('수정');
            $('#msg_industry_category').hide();
            DESIRE_WORK.closeLayerPop(package);

        });

        package.layerPop.find('.btn_reset').on('click', function() {
            var $layerPop = package.layerPop;
            $layerPop.find('input[name="bcode"]:checked').trigger('click');
            setLogScript('business-type', 'select-init');
        });

        package.layerPop.find('.sri_input').on('keyup', function() {
            package.autoComplete.params.keyword = this.value;

            if( !!DESIRE_WORK.autoCompTimeout) {
                clearTimeout(DESIRE_WORK.autoCompTimeout);
            }
            DESIRE_WORK.autoCompTimeout = setTimeout(function() {
                DESIRE_WORK.autoComplete(package);
            }, 200);

        });

    },

    autoComplete: function(package) {
        var $ = jQuery;
        var tpl = '' +
            '<div data-auto_id="desire_industry" class="charge_job_select auto_search"style="display:none">'+
            '<ul class="list_job_charge" style="height: 165px;"></ul>'+
            '<div class="btn_select">'+
            '<button type="button" class="btn_basic_type05 btn_save">선택</button>&nbsp;<button type="button" class="btn_basic_type01 btn_close">취소</button>'+
            '</div></div>';

        $.ajax({
            url: package.autoComplete.url,
            data: package.autoComplete.params,
            dataType: 'json',
            method: 'get',
            success: function (data) {
                // console.log(data);
                DESIRE_WORK.keywordHtml(data, package);
                if ($('[data-auto_id="desire_industry"]').length === 0) {
                    $('#layer_desire_industry').find('.area_search_job').append(tpl);
                }
            }
        });
    },

    keywordHtml : function(data, package) {
        var $ = jQuery;
        var $keywordArea = $('[data-auto_id="desire_industry"]');
        var bcodeList = [];
        var codeList = {};

        $keywordArea.find('ul').empty();
        package.layerPop.find('input[name="bcode"]:checked').each(function () {
            var bcode = $(this).data('bcode').toString();
            bcodeList.push(bcode);
            codeList[bcode] = [];
        });

        package.layerPop.find('input[name="code"]:checked').each(function () {
            var bcode = $(this).data('bcode').toString();
            var code = $(this).data('code').toString();
            codeList[bcode].push(code);
        });

        if (data.contents) {
            var contents = JSON.parse(data.contents),
                upperKeyword = $.trim(package.autoComplete.params.keyword.toUpperCase()),
                length = upperKeyword.length
            ;

            for (var codes in contents) {
                var upperName = '', matchHead = '', matchBody = '', matchTail = '';
                var indexOf, id, name, matchName, checked, bcode, code;

                name = contents[codes];
                bcode = codes.split('|').shift();
                code = codes.split('|').pop();

                id = 'dumi_code_' + bcode + '_' + code;

                if (package.layerPop.find('.sri_input').val() !== '') {
                    // console.log(package.layerPop.find('.sri_input').val());
                    upperName = name.toUpperCase();
                    indexOf = upperName.indexOf(upperKeyword);

                    if (indexOf < 0) {
                        continue;
                    }
                    matchHead = name.substr(0, indexOf);
                    matchBody = name.substr(indexOf, length);
                    matchTail = name.substr(indexOf + length);

                    matchName = matchHead + '<b>' + matchBody + '</b>' + matchTail;
                } else {
                    matchName = name;
                }

                checked = bcodeList.indexOf(bcode) >= 0 && (codeList[bcode] && codeList[bcode].indexOf(code) >= 0) ? true : false;

                $keywordArea.find('ul').append(
                    $('<li>').append(
                        $('<label>', {'for': id, 'class': 'sri_check small' + (checked ? ' check_on' : '')}).append(
                            $('<input>', {
                                'type': 'checkbox',
                                'id': id,
                                'name': 'dumi_code',
                                'class': 'inp_check',
                                'data-bcode': bcode,
                                'data-code': code
                            }).prop('checked', checked).data({'bcode': bcode, 'code': code}),
                            $('<span>', {'class': 'txt_check'}).html(matchName)
                        )
                    )
                );
            }
        } else {
            $keywordArea.find('ul').html('<li class="no_list"><p>일치하는 직종이 없습니다. 직종을 다시 검색해 주세요.</p></li>');
        }
        $keywordArea.show();


        // 자동완성 체크박스 클릭 이벤트
        $keywordArea.find('input[type="checkbox"][id^="dumi_code_"]').on('change', function () {
            var $dumiCode = $(this);
            var bcode = $dumiCode.data('bcode');
            var code = $dumiCode.data('code');

            if ($dumiCode.prop('checked')) {

                if (bcodeList.indexOf(bcode) < 0) {
                    bcodeList = [bcode];
                    codeList[bcode] = [];

                    package.layerPop.find('input[name="dumi_code"]:checked').each(function () {
                        if ($(this).data('bcode') != bcode) {
                            $(this).trigger('click');
                            $(this).closest('label').removeClass('check_on');
                        }
                    });
                }

                if (codeList[bcode] && codeList[bcode].length >= 5) {
                    alert('직종 키워드는 최대 5개까지 등록 가능합니다.');
                    $dumiCode.prop('checked', false).closest('label').removeClass('check_on');
                    return false;
                }

                codeList[bcode].push(code);
            } else {
                if (codeList[bcode].indexOf(code) >= 0) {
                    codeList[bcode].splice(codeList[bcode].indexOf(code), 1);
                }

                if (codeList[bcode].length === 0) {
                    delete codeList[bcode];

                    if (bcodeList.indexOf(bcode) >= 0) {
                        bcodeList.splice(bcodeList.indexOf(bcode), 1);
                    }
                }
            }
        });


        $keywordArea.find('button.btn_save').on('click', function () {
            package.layerPop.find('input[name="bcode"]:checked').each(function () {
                $(this).trigger('click');
                $(this).closest('label').removeClass('check_on');
            });

            for (var bcode in codeList) {
                package.layerPop.find('input[name="bcode"][data-bcode="' + bcode + '"]').trigger('click');
                package.layerPop.find('input[name="bcode"][data-bcode="' + bcode + '"]').closest('label').addClass('check_on');

                $.map(codeList[bcode], function (code) {
                    package.layerPop.find('input[name="code"][data-code="' + code + '"]').trigger('click');
                    package.layerPop.find('input[name="code"][data-code="' + code + '"]').closest('label').addClass('check_on');
                });
            }

            setLogScript('business-type', 'select-complete');
            $keywordArea.hide();
        });

        $keywordArea.find('.btn_basic_type01').on('click', function () {
            $keywordArea.hide();
        });

    },

    deleteDesire : function(target) {
        var $ = jQuery;
        var $target = $('#layer_desire_industry').find('input[name="bcode"][data-bcode="' + $(target).closest('div').find('div').data('bcode') + '"]');
        $('#industry_code').val('');
        $('#industry_keyword').val('');
        $('#industry_selected_area').html('');
        $('button[name="btn_desire_industry"]').text('선택');
        $target.trigger('click');
    },


    openLayerPop: function (package) {
        package.layerPop.show();
    },

    closeLayerPop: function (package) {
        package.layerPop.hide();
    }

};
