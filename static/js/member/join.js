
jQuery(function($) {

	var nm_patten = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z\s]/g;
	var $idCheckMsg1 = $('#idCheckMsg1'),
		$idCheckMsg2 = $('#idCheckMsg2'),
		$password1_warning_txt = $('#password1_warning_txt')
		;

	var emailKeyAction = {
		'13': function(elt) {
			var email = elt.value;
			$('.email_list').hide();
			if (!isPregEmail(email)) {
				$('p[name="msg_email1"]').text('이메일 주소를 다시 확인해주세요.').show();
			}
		},
		'40': function(elt) {
			$(elt).closest('.email_column').find('.auto_list > a').filter(':visible').eq(0).focus();
		}
	};

	$('#frm')
		// 엔터 키 처리.
		.on('keydown', 'input[type="text"], input[type="password"], input[type="number"]', function(e) {
			if (e.keyCode === 13) {
				e.stopPropagation();
				return false;
			}
		})
		// 아이디 문자열 치완
		.on('keyup', '#id', function() {
			var inputVal = this.value;
			if (/[^a-z0-9\_]/gi.test(inputVal)) {
				$idCheckMsg1.text('4 ~ 20자의 영문, 숫자와 특수문자(_)만 사용 가능').show();
				this.value = inputVal.replace(/[^a-z0-9\_]/gi, '');
			}
		})
		.on('focus', '#id', function() {
			$idCheckMsg1.html('<span class="less_important">4 ~ 20자의 영문, 숫자와 특수문자(_)만 사용 가능</span>').show();
			$idCheckMsg2.hide();
		})
		.on('focusout', '#id', function() {
			this.value = this.value.replace(/[^a-z0-9\_]/gi, '');
			$idCheckMsg1.hide();
			$idCheckMsg2.hide();
		})
		.on('blur', '#id', function() {
			idExsistCheck(this.value);
		})
		.on('focus', '#password1', function() {
			if (this.value === '') {
				$password1_warning_txt.show();
			}
		})
		.on('focusout', '#password1', function() {
			$password1_warning_txt.hide();
		})
		.on('keyup', '#password1', function(e) {
			verifyPasswdStrength(e.currentTarget);
		})
		.on('blur', '#password1', function(e) {
			verifyPasswdStrength(e.currentTarget);
		})
		.on('keyup', 'input[name="tmp_cellnum"]', function() {
			if (/[^0-9]/g.test(this.value)) {
				chkPhoneNum(this);
			}
		})
		.on('change', 'input[name="tmp_cellnum"]', function() {
			chkPhoneNum(this);
		})
		.on('blur', '#sms_cellnum, #mail_cellnum', function() {
			chkPhoneNum(this);
			already_phone_join_check();
		})
		.on('keyup', 'input[name="userName"]', function(evt) {
			var elt = evt.currentTarget;
			var user_nm = $.trim(elt.value);
			var $msg_area = $('#' + $('#channel').val() + '_user_nm_msg');

			$msg_area.hide();
			if (nm_patten.test(user_nm)) {
				$msg_area.html('이름에는 특수문자, 숫자는 사용하실 수 없습니다.').show();
				elt.value = user_nm.replace(nm_patten, '');
			}
		})
		.on('blur', 'input[name="userName"]', function() {
			var user_nm = $.trim(this.value);
			var $msg_area = $('#' + $('#channel').val() + '_user_nm_msg');
			$msg_area.hide();

			if(user_nm === '') {
		$msg_area.html('필수정보 입니다.').show();
		return;
	}
	if (nm_patten.test(user_nm)) {
		$msg_area.html('이름에는 특수문자, 숫자는 사용하실 수 없습니다.').show();
	}
	this.value = user_nm.replace(nm_patten, '');
	$('#user_nm').val(this.value);
})
	.on('keyup', 'input[name="tmp_birth_date"]', function() {
		keyEventBirthDate(this);
	})
	.on('change', 'input[name="tmp_birth_date"]', function() {
		keyEventBirthDate(this);
	})
	.on('keyup', 'input[name="tmp_email_id"]', function(e) {
		var $msg_area = $('#' + $('#channel').val() + '_msg_email1');
		var email_patten = /[ㄱ-ㅎㅏ-ㅣ가-힣]/gi;
		$msg_area.hide();
		if (email_patten.test(this.value)) {
			this.value = this.value.replace(email_patten, '');
			$msg_area.show();
		}

		if (this.value === '') {
			$('.email_list').hide();
			return;
		}

		autoEmail(this.value);
		if (!!emailKeyAction[e.keyCode]) {
			emailKeyAction[e.keyCode](e.currentTarget);
		}
	})
	.on('blur', 'input[name="tmp_email_id"]', function() {

		$('body').off('click').on('click', function(e) {
			if (!$(e.target).hasClass("email_domain")) {
				$('.email_list').hide();
			}
		});

		if ($(this).closest('ul').find('.auto_list > a').filter(':visible').length === 0) {
			chkEmail(this);
		}
	})
	.on('blur', 'input[name="tmp_email_id"]', function() {
		chkEmail(this);
		already_phone_join_check();
	})
	.on('click', '.auto_list', function() {
		autoEmailSelect(this);
	})
	.on('keydown', '.auto_list', function(e) {
		if (e.keyCode === 13) {
			autoEmailSelect(this);
		}
		return false;
	})
	.on('keyup', '.auto_list', function(e) {
		var elt = e.currentTarget;
		var $ul = $(elt).closest('ul');
		var $li = $ul.find('.auto_list > a').filter(':visible');
		var index = $li.index($(elt).children());

		if ((index + 1) >= $li.length) {
			index = -1;
		}
		if (e.keyCode === 38) {
			$li.eq(--index).focus();
		}
		if (e.keyCode === 40) {
			$li.eq(++index).focus();
		}

		scrollLockup();
	})

	.on('blur', '#sms_birth_date, #mail_birth_date', function() {
		checkBirth();
	})
	.on('change', '#agree_rule1, #agree_take1', function() {
		if (this.id === 'agree_rule1') {
			toggleChkBox('tc_1', this)
		}
		if (this.id === 'agree_take1') {
			toggleChkBox('tc_2', this)
		}
	})
	.on('click', '#btn_submit', function() {
		personFrmCheck();
	})
	;

function agreeValueChange(val) {
	$('#tc_1_fl').val(val);
	$('#tc_2_fl').val(val);
	$('#agree_rule1').val(val);
	$('#agree_take1').val(val);
	$('#termsAgree').val(val);
	$('#sms_receive_fl').val(val);
}


function isPregEmail(email_str) {
	return /^([a-z0-9\+_\-]+)(\.[a-z0-9\+_\-]+)*@([a-z0-9\-]+\.)+[a-z]{2,6}$/i.test(email_str);
}

function keyEventBirthDate(elt) {
	var $msg = $('#' + $('#channel').val() + '_cyr_msg');
	var birth_date = elt.value;
	$msg.hide();
	if (/[^0-9]/gi.test(birth_date)) {
		$msg.html('생년월일은 숫자만 입력 가능합니다.').show();
		elt.value = birth_date.replace(/[^0-9]/gi, '');
	}
}


/* 성별 체크 */
$('.man').on('click', function(e) {
	$('#sex').val('male');

	$(this).parent('p').addClass('check_man').removeClass('check_woman');
	e.preventDefault();
	if ($('#agreeSelectiveGender').is(':checked') == false) {
		$('#agreeSelectiveGender_label').click();
	}
	$('#collectionBasisContentsSex').css('display', 'none');
});
$('.woman').on('click', function(e) {
	$('#sex').val('female');

	$(this).parent('p').addClass('check_woman').removeClass('check_man');
	e.preventDefault();
	if ($('#agreeSelectiveGender').is(':checked') == false) {
		$('#agreeSelectiveGender_label').click();
	}
	$('#collectionBasisContentsSex').css('display', 'none');
});

/* 약관보기 */
$('.folding_off').on('click', function(e) {
	$(this).parent().parent('li').addClass('on');
	e.preventDefault();
});
$('.folding_on').on('click', function(e) {
	$(this).parent().parent('li').removeClass('on');
	e.preventDefault();
});

/* 메일 체크 */
$('.mail_custom').toggle(
	function() {
		$(this).addClass('check_on').removeClass('check_off').children('input').attr('checked', 'checked');
		$('.mail_detail li').removeClass('balloon');
		$('.set_mail_input').each(function() {
			$(this).attr('checked', 'checked');
		});
	},
	function() {
		$('.set_mail_input').each(function() {
		});
	}
);

/* 마케팅 정보 수신 동의 - 이메일 */
//bkm 2015.09.08
$('.check_mail').toggle(
	function() {
		$('#reject_event').val('on');
		$('#reject_survey').val('on');
	},
	function() {
		$('#reject_event').val('');
		$('#reject_survey').val('');
	}
);

/* 마케팅 정보 수신 동의 - 이메일 (기업) */
//bkm 2015.09.08
$('.check_mail_company').toggle(
	function() {
		$('#c_frm').find('#reject_event').val('on');
		$('#reject_letter').val('on');
	},
	function() {
		$('#c_frm').find('#reject_event').val('');
		$('#reject_letter').val('');
	}
);

/* 전체 동의 */
//bkm 2015.09.08
$('.check_all').on('click',
	function() {
		var $frm = $('#frm');
		if ($('#channel').val() === 'social') {
			$frm = $('#social_frm');
		}
		var $hiddenChkAll = $frm.find('#hidden_check_all');

		if ($hiddenChkAll.val() == '0') {
			//일단 다 끈다.
			if ($frm.find('#agree_rule1').is(':checked')) $frm.find('#agree_rule1').trigger('click');
			if ($frm.find('#agree_take1').is(':checked')) $frm.find('#agree_take1').trigger('click');
			if ($frm.find('#termsAgree').is(':checked')) $frm.find('#termsAgree').trigger('click');
			if ($frm.find('#sms_receive_fl').is(':checked')) $frm.find('#sms_receive_fl').trigger('click');
			if ($frm.find('#personal_info_fl').is(':checked')) $frm.find('#personal_info_fl').trigger('click');

			//다 킨다.
			$frm.find('#agree_rule1').trigger('click');
			$frm.find('#agree_take1').trigger('click');
			$frm.find('#termsAgree').trigger('click');
			$frm.find('#sms_receive_fl').trigger('click');
			$frm.find('#personal_info_fl').trigger('click');

			$hiddenChkAll.val('1');
		} else {
			//일단 다 킨다.
			if (!$frm.find('#agree_rule1').is(':checked')) $frm.find('#agree_rule1').trigger('click');
			if (!$frm.find('#agree_take1').is(':checked')) $frm.find('#agree_take1').trigger('click');
			if (!$frm.find('#termsAgree').is(':checked')) $frm.find('#termsAgree').trigger('click');
			if (!$frm.find('#sms_receive_fl').is(':checked')) $frm.find('#sms_receive_fl').trigger('click');
			if (!$frm.find('#personal_info_fl').is(':checked')) $frm.find('#personal_info_fl').trigger('click');

			//다 끈다.
			$frm.find('#agree_rule1').trigger('click');
			$frm.find('#agree_take1').trigger('click');
			$frm.find('#termsAgree').trigger('click');
			$frm.find('#sms_receive_fl').trigger('click');
			$frm.find('#personal_info_fl').trigger('click');

			$hiddenChkAll.val('0');
		}
	}
);

/* 메일 세팅 열기 */
$('.open_btn').on('click', function(e) {
	$(this).hide().siblings('.mail_custom').show().parent().find('.mail_detail').show();
	e.preventDefault();
});
$('.set_mail_input').on('click', function(e) {
	var allchk = false,
		chkcnt = 0;

	$('.mail_detail li').removeClass('balloon');
	if ($(this).attr('checked') != 'checked') {
		$(this).parent('li').addClass('balloon');
	}
	$('.set_mail_input').each(function() {
		if ($(this).attr('checked') === 'checked') {
			++chkcnt;
		}
	});
	if ($('.set_mail_input').length == chkcnt) {
		$('.mail_custom').addClass('check_on').removeClass('check_off');
	}
	else {
		$('.mail_custom').addClass('check_off').removeClass('check_on');
	}
});

/* 메일 직접 입력 */
$('.self_write').on('click', function(e) {
	$(this).parent().parent().parent('.select_align_row').find('.self_area').addClass('on');
	$(this).parent().parent().parent('.select_align_row').addClass('auto_height');
});
$('.mail_slt').on('click', function(e) {
	$(this).parent().parent().parent('.select_align_row').find('.self_area').removeClass('on');
	$(this).parent().parent().parent('.select_align_row').removeClass('auto_height');
});

/* 인풋 플레이스홀더 대체 */
$(".cont_division").find("input, textarea").each(function() {
	$(this).on('focus', function() {
		$(this).parents('.item').find('label').addClass('on');
	}).on('blur', function() {
		if ($.trim($(this).val()) == "") $(this).parents('.item').find('label').removeClass('on');
	});
});

$('#cellnum').on('keypress', function(ev) {
	ev.stopPropagation();
	var evt = ev || window.event;

	if (!evt.keyCode || evt.keyCode == 0) {
		var code = evt.charCode;
	} else {
		var code = evt.keyCode;
	}

	if ((48 <= code && code <= 57)
		|| code == 8
		|| code == 190
		|| code == 9
		|| code == 45
	) {
	} else {
		evt.preventDefault();
	}
}).on('keyup', function(ev) {
	ev.stopPropagation();
	$(this).removeCharacterWithoutHyphen();
}).on('blur', function(ev) {
	ev.stopPropagation();
	$(this).removeCharacterWithoutHyphen();
});

// 숫자만 입력 체크
$('#birth_year, #birth_month, #birth_day').on('keypress', function(ev) {
	ev.stopPropagation();
	var evt = ev || window.event;

	if (!evt.keyCode || evt.keyCode == 0) {
		var code = evt.charCode;
	} else {
		var code = evt.keyCode;
	}

	if ((48 <= code && code <= 57)
		|| code == 8
		|| code == 190
		|| code == 9
	) {
	} else {
		evt.preventDefault();
	}
}).on('keyup', function(ev) {
	ev.stopPropagation();

	$(this).removeCharacter();

	var id = $(this).attr('id'),
		val = $(this).val();

	if (id === 'birth_year' && val.length === 4) {
		$('#birth_month').focus();
	} else if (id === 'birth_month' && val.length === 2) {
		$('#birth_day').focus();
	}
}).on('blur', function(ev) {
	ev.stopPropagation();

	$(this).removeCharacter();

	var id = $(this).attr('id'),
		val = $(this).val();

	if (id == 'birth_year') {
		//if (val.length != 4 || val < 1900) {
		//    $(this).val('');
		//    if (val.length == 4) {
		//        $(this).focus();
		//    }
		//}

	} else if (id == 'birth_month') {
		//if (val < 1 || val > 12) {
		//    $(this).val('');
		//    if (val.length == 2) {
		//        $(this).focus();
		//    }
		//}
		if (val.length == 1 && val > 0 && val < 10) {
			$(this).val(new String('0' + val));
		}
	} else if (id == 'birth_day') {
		//if (val < 1 || val > 31) {
		//    $(this).val('');
		//}
		if (val.length == 1 && val > 0 && val < 10) {
			$(this).val(new String('0' + val));
		}
	}

	if (id == 'birth_month' || id == 'birth_day') {
		if (val.length == 1 && val > 0 && val < 10) {
			$(this).val(new String('0' + val));
		}
	}

	chkBirthDate();
});

// 이메일
$('#email_dm').on('keydown', function(ev) {
	if ($(this).val().length > 0) {
		$(this).parent().next().find(".tval").text('직접입력');
		$(this).parent().next().find("input").val('직접입력');
	}
}).on('blur', function(ev) {
	var emailDmArr = ['naver.com', 'hanmail.net', 'gmail.com', 'nate.com', 'daum.net', 'hotmail.com'],
		val = $(this).val();
	if (val.length > 0 && $.inArray(val, emailDmArr) != -1) {
		$(this).parent().next().find(".tval").text(val);
		$(this).parent().next().find("input").val(val);
	}
});

// 회원가입 말풍선 레이어 닫기버튼
$("#content").find(".layer_speech_burble").each(function() {
	var btnCloseLayer = $(this).find(".btn_close_layer").eq(0),
		layer = $(this);

	btnCloseLayer.on("click", function() {
		layer.hide();
	});
});

// 약관 상세보기 링크를 새창(윈도우)으로 열기
$("#content").find("a.popup_clause_open").on("click", function(ev) {
	var URL = $(this).attr("href"),
		windowName = $(this).attr("id"),
		spec = "width=816,height=520,top=0,left=0,menubar=0,toolbar=0,location=0,personalbar=0,directories=0,status=0,scrollbars=1,resizable=0";

	window.open(URL, windowName, spec);
	ev.preventDefault();
});

// function 확장
$.fn.extend({
	// 한글/영문 제거
	removeCharacter: function() {
		var $el = $(this);

		if (/[^\d\.]/g.test($el.val())) {
			$el.val($el.val().replace(/[^\d\.]/g, ''));
		}
	},

	// 한글/영문 제거, 하이픈 제외
	removeCharacterWithoutHyphen: function() {
		var $el = $(this);

		if (/[^\d\.\-]/g.test($el.val())) {
			$el.val($el.val().replace(/[^\d\.\-]/g, ''));
		}
	},

	// 한글 제거
	removeKorean: function() {
		var $el = $(this);

		if (/[\ㄱ-ㅎㅏ-ㅣ가-힣]/g.test($el.val())) {
			$el.val($el.val().replace(/[\ㄱ-ㅎㅏ-ㅣ가-힣]/g, ''));
		}
	}
});
});

function set_agree_selective_address() {
	if (jQuery('#agreeSelectiveAddress').prop('checked')) {
		jQuery('#collectionBasisContentsAddress').hide();
		jQuery('#address_sebu').removeAttr('readonly');
	}
	else {
		jQuery('#collectionBasisContentsAddress').show();
		jQuery('#zipcode, #address, #address_main, #address_sebu, #address_details, #overseas').val('');
		jQuery('#overseaText').html('국가 선택');
		jQuery('#address_sebu').attr('readonly', 'readonly');
	}
}

function set_agree_selective_gender() {
	if (jQuery('#hidden_agree_sex').val() == 'on') {
		jQuery('#hidden_agree_sex').val('off');
		jQuery('#collectionBasisContentsSex').show();
		jQuery('#sex_btn').removeClass('check_man').removeClass('check_woman');
		jQuery('#sex').val('');
	}
	else {
		jQuery('#hidden_agree_sex').val('on');
		jQuery('#collectionBasisContentsSex').hide();
	}
}

/* layer popup */
function Lpopview(id) {
	var lpop = document.getElementById(id);
	if (lpop.style.display == "block") {
		lpop.style.display = "none";
	} else {
		lpop.style.display = "block";
	}
	return false
}

function certificationNoticeCompany() {
	jQuery('.tab02').parent('li').addClass('on').siblings().removeClass('on');
	jQuery('#member_corp').show().siblings().hide();

	certifiCationNoticePopupClose();
}

function certifiCationNoticePopupClose() {
	jQuery('.dimmedbg').hide();
	jQuery('.dimmed').hide();
	jQuery('.layer_stop_service').hide();
}

/* select box */
(function($) {

	$.fn.selectBox = function() {
		var $selectElt = $(this);
		$selectElt.find(".seltxt").click(function(e) {

			var $seltxt = $(this),
				$selectbox = $seltxt.closest('.selectbox'),
				$depthLayer = $selectbox.find('.depth')
				;

			if ($seltxt.hasClass('companyCdFix')) return;

			if ($depthLayer.is(':visible')) {
				$seltxt.removeClass("selectIndex");
				$selectbox.find('.depth').hide();
			} else {
				$selectbox.addClass("selectIndex");
				$depthLayer.slideDown("fast", function() {
					$selectbox.find(".depth").focus();
				});
			}

			e.preventDefault();
		});

		$selectElt.parent().find(".depth .value").click(function() {
			$(this).parent(".depth").slideUp("fast", function() {
				$(this).parent().removeClass("selectIndex");
			});

			var catename = $(this).text();
			$(this).parent().parent().find(".tval").text(catename);
			$(this).parent().parent().find("input").val(catename);

			if (this.name === 'choice_company_cd') {
				var company_cd = $(this).data('value');
				var $exception_corp = $('#exception_corp');

				$exception_corp.hide();
				$('#msg_company_cd').hide();
				$('#company_cd').val(company_cd);
				if (company_cd === 10) {
					$exception_corp.show();
				}
			}

			if ($(this).parent().attr('id') == 'email_addr') {
				// 개인회원 이메일
				if ($(this).text() != '직접입력') {
					$(this).parents('form').find('#email_dm').val($(this).text());
				} else {
					$(this).parents('form').find('#email_dm').val('').attr('placeholder', '이메일을 입력해주세요.');
				}

				chkEmail(this);
			}

			return false;
		});

		$selectElt.mouseleave(function() {
			$(this).removeClass("selectIndex");
			$(this).find(".depth").slideUp("fast", function() {
				$(this).removeClass("zindex");
			});
		});

	};

	// 체크박스 클릭. ?
	$('.clickable').on('click', function() {
		$(this).prev('label').trigger('click');
	});


	$(".selectbox").selectBox();
	// $(".popup_selectbox").selectBox();

	/* 동의 체크 */
	$('.check_custom').toggle(
		function() {
			$(this).addClass('check_on').removeClass('check_off').children('input').attr('checked', 'checked').trigger('change');
		},
		function() {
			$(this).addClass('check_off').removeClass('check_on').children('input').removeAttr('checked').trigger('change');
		}
	).click(
		function() {
			var $frm = $('#frm');
			if ($('#channel').val() === 'social') {
				$frm = $('#social_frm');
			}
			if ($frm.find('#agree_rule1').is(':checked')
				&& $frm.find('#agree_take1').is(':checked')
				&& $frm.find('#termsAgree').is(':checked')
				&& $frm.find('#sms_receive_fl').is(':checked')
				&& $frm.find('#personal_info_fl').is(':checked')) {
				$frm.find('#agreeAllPersonal').parents().addClass('check_on').removeClass('check_off').children('input').attr('checked', 'checked');
				$frm.find('#hidden_check_all').val('1');
			} else {
				$frm.find('#agreeAllPersonal').parents().addClass('check_off').removeClass('check_on').children('input').removeAttr('checked');
				$frm.find('#hidden_check_all').val('0');
			}
		}
	);

	$('.dormancy_term')
		.on('click', '.txt_check, .sri_check', function() {
			var $elt = $(this);
			var $label = $elt.hasClass('sri_check') ? $elt : $elt.closest('label');
			var $checkbox = $label.find('.inp_check');

			if (!$label.hasClass('check_on')) {
				$('.sri_check').not(this).removeClass('check_on');
				if ($label.hasClass('check_on')) {
					$label.removeClass('check_on');
					$checkbox.prop('checked', false);
				} else {
					$label.addClass('check_on');
					$checkbox.prop('checked', true);
				}
			}
		})
		;

	$('#layer_pop_byemail, #layer_pop_byphone')
		.on('keyup', 'input[type="text"]', function() {
			if (this.value.length > 6) {
				this.value = this.value.substr(0, 6);
			}
		})
		;

	/* 레이어 팝업 닫기 */
	$('#p_member_nudge').on('click', '.close_btn', function() {
		$('#p_member_nudge').hide();
		// $('#password1').prop({type:"password"});
	});

	$(function() {
		if ($('#c_frm').length > 0) {
			setLogScript('company', '', 'com-tab', 'click_tab');
		} else {
			try { n_trackEvent('join', 'applicant', ''); } catch (e) { }
		}

	})
})(jQuery);


// 아이디 사용여부 체크
var idLogChk = false;
var idExsistCheck = function(id_val) {

	var $id = $('#id');
	var $formObj = $id.closest('form').eq(0);
	var $idCheckMsg1 = $('#idCheckMsg1');
	var $idCheckMsg2 = $('#idCheckMsg2');
	var isCompanyJoin = isCompany($('#id'));
	id_val = id_val.replace(/[^a-z0-9\_]/gi, '');

	if ($id.closest('form').length < 1) {
		return false;
	}

	if (id_val === '' || $id.get(0).getAttribute('placeholder') === id_val) {
		if (isCompanyJoin && $id.hasClass('invalid')) {
			$id.removeClass('invalid');
			$idCheckMsg1.attr('class', 'mag_invalid notice_txt');
		}
		$idCheckMsg1.html('<span class="less_important">4 ~ 20자의 영문, 숫자와 특수문자(_)만 사용 가능</span>').show();
		return false;
	}

	$id.val(id_val);
	$('#id_chk_ok').val('0');
	$idCheckMsg1.hide();
	$idCheckMsg2.hide();
	if (isCompanyJoin && $id.hasClass('invalid')) {
		$id.removeClass('invalid');
	}
	$idCheckMsg1.attr('class', 'mag_invalid warning_txt');

	if (id_val.length < 4) {
		if (isCompanyJoin && !$id.hasClass('invalid')) {
			$id.addClass('invalid');
		}
		$idCheckMsg1.html('4 ~ 20자의 영문, 숫자와 특수문자(_)만 사용 가능').show();
		return false;
	}

	$.ajax({
		data: {
			'id': id_val,
			'type': 'json'
		},
		dataType: 'json',
		type: 'get',
		url: 'http://localhost:8081/member/id-check',
		success: function(response, status, request) {
			if (response.code === 'duplicate') {
				if (isCompanyJoin && !$id.hasClass('invalid')) {
					$id.addClass('invalid');
				}
				$idCheckMsg1.text('이미 사용중인 아이디입니다.').show();
				return false;
			} else {
				if (id_val.replace(" ", "") !== id_val || id_val.length < 4 || !engornum(id_val)) {
					if (isCompanyJoin && !$id.hasClass('invalid')) {
						$id.addClass('invalid');
					}
					$idCheckMsg1.text('다른 아이디를 입력해주세요.').show();
					return false;
				} else {
					$idCheckMsg2.text('사용가능한 아이디입니다.').show();
					if ($formObj.get(0).name === 'c_frm' && idLogChk === false) {
						setLogScript('account-info', 'identification', 'Id_input', 'Id_check');
						idLogChk = true;
					}
				}

				$formObj.find('#id_chk_ok').val('1');
				return true;
			}
		}
	});

	function engornum(strdata) {
		for (a = 0; a < strdata.length; a++) {
			var sid = strdata.substring(a, a + 1);
			if ((sid < "0" || sid > "9") && (sid < "a" || sid > "z") && (sid < "A" || sid > "Z") && sid != "_") {
				return false;
			}
		}
		return true;
	}
};

//이메일 체크
var emailLogChk = false;
var chkEmail = function(obj) {
	// if (!window.setBlurFlag) {
	//     return false;
	// }

	var channel = $('#channel').val(),
		$email_id = $('#' + channel + '_email_id'),
		$msg_email1 = $('#' + channel + '_msg_email1'),
		$msg_email2 = $('#' + channel + '_msg_email2'),
		valEmailId = $.trim($email_id.val()),
		isCompanyJoin = $('#member_corp').length > 0 ? 'y' : 'n'
		;

	$msg_email1.hide();
	$msg_email2.hide();
	if (isCompanyJoin === 'y') {
		if ($email_id.hasClass('invalid')) {
			$email_id.removeClass('invalid');
		}
	}
	$('#msg_email2').hide();
	if (valEmailId === '') {
		$msg_email1.show();
		if (isCompanyJoin === 'y') {
			$email_id.addClass('invalid');
		}
		return false;
	}

	var email = $email_id.val();

	var reg_email = /^[0-9a-z_+-]+([\.]*[0-9a-z_+-])*@([0-9a-z_-]+\.)+[a-z]{2,10}$/i;
	if (email !== '' && email.search(reg_email) == -1) {
		$msg_email1.text('이메일 주소를 다시 확인해주세요.').show();
		if (isCompanyJoin === 'y') {
			$email_id.addClass('invalid');
		}
		return false;
	}

	$('#email').val(email);
	$('#email_id').val(email);
	if (isCompany(obj) && emailLogChk === false) {
		setLogScript('manager-info', 'e-mail', 'Email_input', 'Email_check');
		emailLogChk = true;
	}
	return true;

};

var checkBirth = function() {
	// if (!window.setBlurFlag) {
	//     return false;
	// }
	var channel = $('#channel').val();
	var $channel_birth = $('#' + channel + '_birth_date');
	var $msg = $('#' + channel + '_cyr_msg');
	var birth_date = $channel_birth.val().replace(/[^0-9]/gi, '');
	var $birth_date = $('#birth_date');
	var $birth_year = $('#birth_year'),
		$birth_month = $('#birth_month'),
		$birth_day = $('#birth_day')
		;

	$birth_date.val('');

	if (birth_date.length !== 8) {
		$msg.html("YYYYMMDD<BR>생년월일 입력형식을 확인해주세요.").show();
		$birth_year.val('');
		$birth_month.val('');
		$birth_day.val('');
		return;
	}

	var birth_year_num = Number(birth_date.substr(0, 4));
	var birth_month_num = Number(birth_date.substr(4, 2));
	var birth_day_num = Number(birth_date.substr(6, 2));

	//년
	if (birth_year_num < 1900 || birth_year_num > $('#current_year').val()) {
		$msg.html('생년월일 입력형식을 확인해주세요.').show();
		return;
	}
	//월
	else if (birth_month_num < 1 || birth_month_num > 12) {
		$msg.html('생년월일 입력형식을 확인해주세요.').show();
		return;
	}
	//일
	else if (birth_day_num < 1 || birth_day_num > 31) {
		$msg.html('생년월일 입력형식을 확인해주세요.').show();
		return;
	}
	//성공
	else {
		$msg.hide();
	}

	$birth_date.val(birth_date.replace(/[^0-9]/gi, ''));
	$birth_year.val(birth_year_num);
	$birth_month.val(birth_month_num);
	$birth_day.val(birth_day_num);

	return true;
};

//휴대폰 번호 체크 (호출되는 곳 없음)
var phoneLogChk = false;
var chkPhoneNum = function(elt) {
	var $msg_phone = $('#' + $('#channel').val() + '_phone_msg');
	var $cellnum = $('#cellnum');
	var cellNum = elt.value;
	var overseas_fl = $('#overseas_fl').val();
	var isCompanyJoin = isCompany(elt);
	var cellLen = cellNum.length,
		cell1 = $('#cell1'),
		cell2 = $('#cell2'),
		cell3 = $('#cell3')
		;

	cell1.val('');
	cell2.val('');
	cell3.val('');
	$msg_phone.hide();
	if (isCompanyJoin) {
		if ($cellnum.hasClass('invalid')) {
			$cellnum.removeClass('invalid');
		}
	}

	if (cellNum === '' && overseas_fl !== "1") {
		if (isCompanyJoin) {
			if (!$cellnum.hasClass('invalid')) {
				$cellnum.addClass('invalid');
			}
		}
		$msg_phone.text('필수정보 입니다.').show();
		$cellnum.val('');
		return;
	}

	replacePhoneNum(elt);
	cellNum = elt.value;

	if ((!$.isNumeric(cellNum) || cellNum.length < 10 || cellNum.length > 11) && overseas_fl !== "1") {
		if (isCompanyJoin) {
			if (!$cellnum.hasClass('invalid')) {
				$cellnum.addClass('invalid');
			}
		}
		$msg_phone.text('휴대폰번호가 올바르지 않습니다.').show();
		return;
	}

	$cellnum.val(cellNum);
	if (cellLen === 10) {
		cell1.val(cellNum.substr(0, 3));
		cell2.val(cellNum.substr(3, 3));
		cell3.val(cellNum.substr(6));
	} else if (cellLen === 11) {
		cell1.val(cellNum.substr(0, 3));
		cell2.val(cellNum.substr(3, 4));
		cell3.val(cellNum.substr(7));
	}

	if (isCompany(elt) && phoneLogChk === false) {
		setLogScript('manager-info', 'cellphone-number');
		phoneLogChk = true;
	}
};

var replacePhoneNum = function(elt) {
	var maxLen = $('#overseas_fl').val() === "1" ? 30 : 11;
	elt.value = elt.value.replace(/[^0-9]/g, '');
	elt.value = elt.value.substr(0, maxLen);

};

var chkManagerName = function(obj) {
	var name_pattern = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z\s]/gi;
	var inputVal = $.trim($(obj).val());
	var repInputVal = inputVal.replace(name_pattern, '');
	var $msg_corp_charge = $(obj).next('p');

	if (inputVal === '') {
		$(obj).next('p').text('필수정보 입니다.').show();
		return;
	}


	$(obj).val(repInputVal);
	$('#manager_nm').val(repInputVal);
};

function chkManagerNm(obj) {

	var inputVal = $.trim($(obj).val());
	var name_pattern = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z\s]/gi;
	var $msg_corp_charge = $(obj).next('p');
	var $manager_nm = $('#manager_nm');
	var repInputVal = inputVal.replace(name_pattern, '');

	$msg_corp_charge.hide();

	if (inputVal === '') {
		if (!$(obj).hasClass('invalid')) {
			$(obj).addClass('invalid');
		}
		$(obj).next('p').text('필수정보 입니다.').show();
		$manager_nm.val('');
		return;
	}

	if (name_pattern.test(inputVal)) {
		if (!$(obj).hasClass('invalid')) {
			$(obj).addClass('invalid');
		}
		$(obj).val(repInputVal);
		$msg_corp_charge.text('담당자명에는 특수문자, 숫자는 사용하실 수 없습니다').show();
		return false;
	}
	$(obj).val(repInputVal);
	$manager_nm.val(repInputVal);
	if ($(obj).hasClass('invalid')) {
		$(obj).removeClass('invalid');
	}
}



function chkEssentialFieldIsEmpty(elem, msgId) {
	var $msg_obj = jQuery('#' + msgId);
	$msg_obj.hide();
	if (jQuery(elem).val() === '') {
		$msg_obj.text('필수정보 입니다.').show();
		return false;
	}
	return true;
}

// 비밀번호 체크
var password1LogChk = false;
var verifyPasswdStrength = function(elmt) {
	var password = elmt.value;
	var formObj = $(elmt).parents('form');
	var $password1_warning_txt = formObj.find('#password1_warning_txt');
	var $password1_good_txt = formObj.find('#password1_good_txt');
	var id_val = formObj.find('#id').val();
	var isCompanyJoin = isCompany(elmt);

	$password1_warning_txt.hide();
	$password1_good_txt.hide();
	if (isCompanyJoin && $(elmt).hasClass('invalid')) {
		$(elmt).removeClass('invalid');
	}

	if ($.trim(password) === '' || elmt.getAttribute('placeholder') === password) {
		if (isCompanyJoin) {
			$password1_warning_txt.attr('class', 'mag_invalid notice_txt');
		}
		$password1_warning_txt.html('<span class="less_important">8~16자리 영문 대소문자, 숫자, 특수문자 중 3가지 이상 조합</span>').show();
		return false;
	}

	if (password.length > 16) {
		$(elmt).val(password.substr(0, 16));
		$password1_warning_txt.html('<span class="less_important">8~16자리 영문 대소문자, 숫자, 특수문자 중 3가지 이상 조합</span>').show();
	}

	if (PasswordStrength.verify(password, "", id_val)) {
		//var testVal = PasswordStrength.verify(elmt.value, "", "");
		$password1_good_txt.text(PasswordStrength.getStrength()).show();
		if (isCompany(elmt) && password1LogChk === false) {
			setLogScript('account-info', 'password-confirm', 'Pwd_input', 'Pwd_check');
			password1LogChk = true;
		}
		return true;
	}
	if (isCompanyJoin) {
		if ($(elmt).hasClass('invalid')) {
			$(elmt).addClass('invalid');
		}
		$password1_warning_txt.attr('class', 'mag_invalid warning_txt');
	}
	$password1_warning_txt.html(PasswordStrength.getStrength() + '<br><span>' + PasswordStrength.getMessage() + '</span>').show();
	return false;
};

// var authMobile = {
//     replacePhoneNum : function(elt) {
//         var maxLen = $('#overseas_fl').val() === "1" ? 30 : 11;
//         elt.value = elt.value.replace(/[^0-9]/g, '');
//         elt.value = elt.value.substr(0, maxLen);
//     },
//     chkPhone : function(elt) {
//         if (!window.setBlurFlag) {
//             return false;
//         }
//
//         var $msg_phone = $('p[name="msg_phone"]');
//         var cellNum = elt.value;
//         $msg_phone.hide();
//
//         if (cellNum === '') {
//             $msg_phone.text('필수정보 입니다.').show();
//             return;
//         } else if (!$.isNumeric(cellNum) || cellNum.length < 10  || cellNum.length > 11) {
//             $msg_phone.text('휴대폰번호가 올바르지 않습니다.').show();
//             return;
//         }
//
//         $('#cellnum').val(cellNum);
//     }
// };

// 체크박스 컨트롤
var toggleChkBox = function(id, obj) {
	var formObj = $(obj).parents('form');

	var obj_chk = formObj.find('#' + id + '_fl');
	if ($(obj_chk).val() === 'n') {
		$(obj_chk).val('y');
		//obj_chk.value = 'y';
	} else {
		$(obj_chk).val('n');
		//obj_chk.value = 'n';
	}
};

function regCominfoView() {
	var csn = $('#corp_code').val();
	var reg = /-/gi;
	csn = csn.replace(reg, '');
	window.open('/zf_user/company-info/view?csn=' + csn);
};

function selectOverseaCom() {
	$('#overseas_csn').show();
	$('#temporary_csn_type').val('waiting');
};

function selectWaitingCsn() {
	$('#overseas_csn').hide();
	$('#temporary_csn_type').val('overseas');
};

function noticePopUp(popupName) {
	$('#' + popupName).addClass('opened');
};

function closeNoticePopUp(popupName) {
	$('#' + popupName).removeClass('opened');
};

function hideNoticeTxt() {
	$('#msg_corp_code_1').hide();
	$('#msg_corp_code_2').hide();
	$('#nice_notice_txt').hide();
	$('#saramin_notice_txt').hide();
	$('#first_notice_txt').hide();
};

function existsCompanyinfoSearch() {
	var csn = $('#corp_code').val();

	if (!csn) {
		alert('필수 인자값이 없습니다.');
		return;
	}

	var url = '/zf_user/member/registration/search-csn-ajax';

	try {
		$.ajax({
			type: "POST",
			url: url,
			data: { csn: csn },
			dataType: "json",
			success: function(json) {
				if (json.status == 'success') {
					hideNoticeTxt();
					$('#saramin_notice_txt').show();
				} else {
					hideNoticeTxt();
					$('#first_notice_txt').show();
				}
			},
			error: function(e) {
				alert('정보 호출에 실패하였습니다.!!!!' + e.responseText);
			}
		});
	} catch (e) {
		return false;
	}
}

// -------------

function isCompany(obj) {
	var form = $(obj).closest('form').attr('name');
	if (form === 'c_frm') {
		return true;
	} else {
		return false;
	}
}

/**
 * 기업회원 가입시 호출하는 와이즈로그, Google Analytics 스크립트
 * @param wl_action
 * @param wl_optlabel
 * @param ga_eventflow
 * @param ga_eventlabel
 */
function setLogScript(wl_action, wl_optlabel, ga_eventflow, ga_eventlabel) {
	if (wl_action != null && wl_optlabel != null) {
		try { n_trackEvent('join', wl_action, wl_optlabel); } catch (e) { }
	}

	if (ga_eventflow != null && ga_eventlabel != null) {
		try {
			dataLayer.push({
				'event': 'ga_lead',
				'category': 'company_join',
				'event-flow': ga_eventflow,
				'event-label': ga_eventlabel
			})
		} catch (e) {
		}
	}
}

// -----------

var JOIN = {};

/**
 * 만 나이 계산
 * @param birthDate
 * @returns {number|*}
 */
var getAmericanAge = function(birthDate) {
	var age;
	var year = String(birthDate).substring(0, 4);
	var mmdd = String(birthDate).substring(4, 6) + String(birthDate).substring(6, 8);

	var d = new Date();
	var tmonth = d.getMonth() + 1;
	var tdate = d.getDate();

	var today = String((tmonth < 10) ? '0' + tmonth : tmonth) + String((tdate < 10) ? '0' + tdate : tdate);

	age = d.getFullYear() - parseInt(year, 10) + 1;

	if (today < mmdd) {
		age = age - 2;
	} else {
		age = age - 1;
	}

	return age;
};

var autoEmail = function(email) {
	var $ = jQuery;
	var $email_list = $('.' + autoEmailForm()).find('.email_list');
	var $li = $email_list.find('li');
	var email_split = email.split('@');

	$('.auto_list .txt_input').html(email_split[0]);
	$email_list.show();
	$li.show();
	if (email.indexOf('@') !== -1) {
		$.each($li, function(index, value) {
			var inputEmail = value.innerText.match(/[a-zA-Z]+\.+[a-zA-Z]{2,}/g)[0];
			if (inputEmail.indexOf(email_split[1]) !== 0) {
				$($li[index]).hide();

			}
		});
	}

	if (!$li.is(':visible')) {
		$email_list.hide();
	}
};

var autoEmailForm = function() {
	var channel = jQuery('#channel').val();
	var div_str = 'identify_phone';
	if (channel === 'mail') {
		div_str = 'identify_mail'
	} else if (channel === 'ipin') {
		div_str = 'identify_pin'
	} else if (channel === 'social') {
		div_str = 'identify_social';
	}
	return div_str;
};

// 스크롤 고정 처리
var scrollLockup = function() {
	var $ = jQuery;
	var scrollTop = $(window).scrollTop();
	var h = function() {
		$(window).scrollTop(scrollTop);
	};
	$(window).scroll(h);
	setTimeout(function() {
		$(window).off("scroll", h);
	}, 500);
};

var personFrmCheck = function() {

	var $ = jQuery;
	var form = $('#frm'),
		$idCheckMsg1 = $('#idCheckMsg1'),
		$idCheckMsg2 = $('#idCheckMsg2'),
		$id = $('#id'),
		$password1_warning_txt = $('#password1_warning_txt'),
		$password1_good_txt = $('#password1_good_txt'),
		$password1 = $('#password1'),
		$user_nm_msg = $('p[name="user_nm_msg"]'),
		channel = $('#channel').val(),
		$user_nm = $('#' + channel + '_user_nm'),
		$cyr_msg = $('#cyr_msg'),
		$birth_date = $('#' + channel + '_birth_date'),
		$cellnum = $('#' + channel + '_cellnum'),
		$email = $('#' + channel + '_email_id'),
		$phone_msg = $('#phone_msg'),
		$overseas_fl = $('#overseas_fl'),
		$confirm_status = $('#confirm_status'),
		$msg_email1 = $('#msg_email1'),
		$address_sebu = $('#address_sebu'),
		$id_chk_ok = $('#id_chk_ok')
		;

	$idCheckMsg1.hide();
	$idCheckMsg2.hide();
	if ($.trim($id.val()) === '') {
		alert('아이디를 입력해 주세요.');
		$id.focus();
		$idCheckMsg1.text('필수정보 입니다.').show();
		return false;
	} else if ($id_chk_ok.val() == '1') {
		$idCheckMsg2.show();
	} else if ($id_chk_ok.val() != '1') {
		alert('다른 아이디를 입력해 주세요.');
		$id.focus();
		idExsistCheck($.trim($id.val()));
		return false;
	}

	$password1_warning_txt.hide();
	// $password1_good_txt.hide();
	if ($.trim($password1.val()) === '') {
		alert('비밀번호를 입력해주세요.');
		$password1.focus();
		$password1_warning_txt.text('필수정보 입니다.').show();
		return false;
	}

	// PasswordStrength
	var passwd1 = $password1.val();
	if (passwd1 && false === PasswordStrength.verify(passwd1, "", $id.val())) {
		alert('비밀번호를 다시 입력해 주세요.');
		$password1.focus();
		$password1_warning_txt.html(PasswordStrength.getStrength() + '<br><span>' + PasswordStrength.getMessage() + '</span>').show();
		return false;
	}

	// 휴대폰 인증이 안되어 있는 경우 체크
	if ($confirm_status.val() !== 'complete') {
		alert('인증을 완료하세요.');
		location.href = '#pos_cert_num';
		return false;
	}

	$user_nm_msg.hide();
	if ($.trim($user_nm.val()) === '') {
		alert('이름을 입력해주세요.');
		$user_nm.attr('readonly', false);
		$user_nm.focus();
		$user_nm_msg.text('필수정보 입니다.').show();
		return false;
	}

	var name_pattern = /[#\&\-%@=\/\\\:;,'\"\^`~\_|\!\?\*$\[\]\{\}0-9]/;
	if (name_pattern.test($user_nm.val()) === true) {
		alert('이름에 특수문자, 숫자는 사용하실 수 없습니다.');
		$user_nm.attr('readonly', false);
		$user_nm.focus();
		$user_nm_msg.text('이름에 특수문자, 숫자는 사용하실 수 없습니다.').show();
		return false;
	}

	$cyr_msg.hide();
	var birth_year = $('#birth_year').val(),
		birth_month = $('#birth_month').val(),
		birth_day = $('#birth_day').val();

	if (birth_year === '' || birth_year < 1900) {
		alert('생년월일을 입력해주세요..');
		$birth_date.focus();
		$cyr_msg.text('필수정보 입니다.').show();
		return false;
	}
	if (birth_month === '' || birth_month < 1 || birth_month > 12) {
		alert('생년월일을 입력해주세요.');
		$birth_date.focus();
		$cyr_msg.text('필수정보 입니다.').show();
		return false;
	}
	if (birth_day === '' || birth_day < 1 || birth_day > 31) {
		alert('생년월일을 입력해주세요.');
		$birth_date.focus();
		$cyr_msg.text('필수정보 입니다.').show();
		return false;
	}

	if (getAmericanAge(birth_year + birth_month + birth_day) < 15) {
		alert('만 15세 이상만 가입할 수 있습니다.');
		$birth_date.focus();
		return false;
	}

	$phone_msg.hide();
	if ($overseas_fl.val() != '1') {
		var celNum = $cellnum.val();
		var celNumLen = celNum.length;
		if (celNum === '' || celNumLen < 10 || celNumLen > 11) {
			alert('휴대폰 번호를 확인해주세요.');
			$cellnum.focus();
			$phone_msg.text('필수정보 입니다.').show();
			return false;
		}
	}

	$msg_email1.hide();
	if ($email.val() === '') {
		alert('이메일을 입력해 주세요.');
		$email.focus();
		$msg_email1.text('필수정보 입니다.').show();
		$('#msg_email2').hide();
		return false;
	} else if ($email.val() !== '' && $email.val().search(/^[0-9a-z._+-]+@([0-9a-z_-]+\.)+[a-z]{2,10}$/i) == -1) {
		alert('이메일 주소를 다시 확인해주세요.');
		$email.focus();
		$msg_email1.text('이메일 주소를 다시 확인해주세요.').show();
		return false;
	}

	$('#tc_msg').hide();
	if ($('#tc_1_fl').val() === 'n' || $('#tc_2_fl').val() === 'n') {
		alert('약관에 동의해 주세요.');
		location.href = "#person_terms_title"; //bkm 2015.09.10
		return false;
	}

	//정보보유기간
	if ($('input[name="dormancy_term"]:checked').length === 0) {
		alert('정보보유기간을 선택해주세요.');
		return false;
	}

	if ($address_sebu.val() != '상세주소') {
		$('#address_details').val($address_sebu.val());
	}

	//bkm 2015.09.08
	//주소, 성별 동의를 언체크하면 값 넘기지 않기
	if (!$('#agreeSelectiveAddress').is(':checked')) {
		$('#zipcode1').val('');
		$('#zipcode2').val('');
		$('#zipcode').val('');
		$('#address').val('');
		$('#address_details').val('');
		$('#old_address').val('');
		$('#old_zipcode').val('');
		$('#old_address_details').val('');
		$('#new_address').val('');
		$('#new_zipcode').val('');
		$('#new_address_details').val('');
		$('#new_address_extra').val('');
	} else {
		// 해외 주소인 경우 강제로 구주소로 입력해준다.
		if ($('#check_global').is(':checked')) {
			var globalAddress = $('#address').val();
			var globalZipcode = $('#zipcode').val();

			if (!globalZipcode) {
				alert('국가를 선택해 주세요.');
				return false;
			} else {
				$('#old_address').val(globalAddress);
				$('#old_zipcode').val(globalZipcode);
				$('#old_address_details').val('');
				$('#new_address').val('');
				$('#new_zipcode').val('');
				$('#new_address_details').val('');
				$('#new_address_extra').val('');
				$('#address_sido').val('');
				$('#address_sigungu').val('');
				$('#x_coordinate').val('');
				$('#y_coordinate').val('');
				$('#zip_use_type').val('J');
			}
		}
	}

	// 입력한 주소가 없을때 공백처리
	if (!$('#address').val()) {
		if (confirm("기본(상세)주소가 입력되지 않았습니다. 계속 하시겠습니까?")) {
			$('#old_address').val('');
			$('#old_zipcode').val('');
			$('#new_address').val('');
			$('#new_zipcode').val('');
			$('#new_address_details').val('');
			$('#new_address_extra').val('');
			$('#address_sido').val('');
			$('#address_sigungu').val('');
			$('#x_coordinate').val('');
			$('#y_coordinate').val('');
			$('#zip_use_type').val('J');
		} else {
			return false;
		}
	}

	if (!$('#agreeSelectiveGender').is(':checked')) {
		$('#sex').val('');
	}

	form.submit();
};


var personSocialFrmCheck = function() {
	var $ = jQuery;
	var $user_nm_msg = $('p[name="user_nm_msg"]'),
		$user_nm = $('#social_user_nm'),
		$cyr_msg = $('#cyr_msg'),
		$birth_date = $('#social_birth_date'),
		$cellnum = $('#social_cellnum'),
		$email = $('#social_email_id'),
		$phone_msg = $('#phone_msg'),
		$overseas_fl = $('#overseas_fl'),
		$msg_email1 = $('#msg_email1')
		;

	$msg_email1.hide();
	if ($email.val() === '') {
		alert('이메일을 입력해 주세요.');
		$email.focus();
		$msg_email1.text('필수정보 입니다.').show();
		$('#msg_email2').hide();
		return false;
	} else if ($email.val() !== '' && $email.val().search(/^[0-9a-z._+-]+@([0-9a-z_-]+\.)+[a-z]{2,10}$/i) == -1) {
		alert('이메일 주소를 다시 확인해주세요.');
		$email.focus();
		$msg_email1.text('이메일 주소를 다시 확인해주세요.').show();
		return false;
	}

	$user_nm_msg.hide();
	if ($.trim($user_nm.val()) === '') {
		alert('이름을 입력해주세요.');
		$user_nm.attr('readonly', false);
		$user_nm.focus();
		$user_nm_msg.text('필수정보 입니다.').show();
		return false;
	}

	var name_pattern = /[#\&\-%@=\/\\\:;,'\"\^`~\_|\!\?\*$\[\]\{\}0-9]/;
	if (name_pattern.test($user_nm.val()) === true) {
		alert('이름에 특수문자, 숫자는 사용하실 수 없습니다.');
		$user_nm.attr('readonly', false);
		$user_nm.focus();
		$user_nm_msg.text('이름에 특수문자, 숫자는 사용하실 수 없습니다.').show();
		return false;
	}

	$cyr_msg.hide();
	var birth_year = $('#birth_year').val(),
		birth_month = $('#birth_month').val(),
		birth_day = $('#birth_day').val();

	if (birth_year === '' || birth_year < 1900) {
		alert('생년월일을 입력해주세요..');
		$birth_date.focus();
		$cyr_msg.text('필수정보 입니다.').show();
		return false;
	}
	if (birth_month === '' || birth_month < 1 || birth_month > 12) {
		alert('생년월일을 입력해주세요.');
		$birth_date.focus();
		$cyr_msg.text('필수정보 입니다.').show();
		return false;
	}
	if (birth_day === '' || birth_day < 1 || birth_day > 31) {
		alert('생년월일을 입력해주세요.');
		$birth_date.focus();
		$cyr_msg.text('필수정보 입니다.').show();
		return false;
	}

	if (getAmericanAge(birth_year + birth_month + birth_day) < 15) {
		alert('만 15세 이상만 가입할 수 있습니다.');
		$birth_date.focus();
		return false;
	}

	$phone_msg.hide();
	if ($overseas_fl.val() != '1') {
		var celNum = $cellnum.val();
		var celNumLen = celNum.length;
		if (celNum === '' || celNumLen < 10 || celNumLen > 11) {
			alert('휴대폰 번호를 확인해주세요.');
			$cellnum.focus();
			$phone_msg.text('필수정보 입니다.').show();
			return false;
		}
	}

	$('#tc_msg').hide();
	if ($('#tc_1_fl').val() === 'n' || $('#tc_2_fl').val() === 'n') {
		alert('약관에 동의해 주세요.');
		location.href = "#person_terms_title"; //bkm 2015.09.10
		return false;
	}

	if ($('input[name="dormancy_term"]:checked').length === 0) {
		alert('개인정보 유효기간을 선택하여 주십시요.');
		return false;
	}

	$('#social_frm').submit();
};

var autoEmailSelect = function(elt) {
	var mail = $.trim($(elt).text());

	$('#' + $('#channel').val() + '_email_id').val(mail);
	chkEmail(elt);
	$('.email_list').hide();
};

var confirm_layer_close;
var changeConfirmCell;
var sendCodeAction;
var layerPopupText;
var set_overseas_selective;
var already_phone_join_check;
var sendCodeTimer = null;

jQuery(function($) {

	var overseas_fl = $('#overseas_fl'),
		collectionBasisContentsOverseas = $('#collectionBasisContentsOverseas'),
		channel = $('#channel'),
		mail_confirm_complete = $('#mail_confirm_complete'),
		sms_confirm_complete = $('#sms_confirm_complete'),
		ipin_confirm_complete = $('#ipin_confirm_complete'),
		confirm_status = $('#confirm_status'),
		confirm_method = $('#confirm_method'),
		sms_code = $('#sms_code'),
		email_code = $('#email_code'),
		cellnum = $('#cellnum'),
		email_id = $('#email_id'),
		email_dm = $('#email_dm'),
		certi_phone1 = $('#certi_phone1'),
		certi_phone2 = $('#certi_phone2'),
		phone_certi_list = $('li[name="phone_certi_list"]'),
		list_mail = $('#list_mail'),
		email_confirm_msg = $('#email_confirm_msg'),
		phone_msg = $('#phone_msg'),
		name_phone_msg = $('p[name="name_phone_msg"]'),
		phone_msg_good = $('#phone_msg_good'),
		phone_confirm_msg = $('#phone_confirm_msg'),
		confirm_remain_mail_time_area = $('#confirm_remain_mail_time_area'),
		confirm_remain_sms_time_area = $('#confirm_remain_sms_time_area'),
		confirm_remain_time_zone = $('#confirm_remain_time_zone'),
		confirm_remain_time_area = $('#confirm_remain_time_area'),
		pop_byemail = $('#pop_byemail'),
		pop_byphone = $('#pop_byphone'),
		layer_pop_byphone = $('#layer_pop_byphone'),
		layer_pop_byemail = $('#layer_pop_byemail'),
		cell1 = $('#cell1'),
		cell2 = $('#cell2'),
		cell3 = $('#cell3')
		;

	channel.val('sms');
	sms_confirm_complete.val('n');
	mail_confirm_complete.val('n');

	var clearId = '';
	function startConfirmTimer() {
		var minute = 3;
		var second = 0;

		if ($('.layer_identify.open').attr("id") == 'layer_pop_byphone') {
			confirm_remain_sms_time_area.html('남은시간 (<span id="confirm_sms_remain_time"></span>)');
		} else {
			confirm_remain_mail_time_area.html('남은시간 (<span id="confirm_mail_remain_time"></span>)');
		}

		setTimeText(minute, second);

		stopConfirmTimer();

		clearId = setInterval(lap, 1000);

		function setTimeText(minute, second) {
			var second_text = (second / 10) < 1 ? "0" + second : second;

			if ($('.layer_identify.open').attr("id") == 'layer_pop_byphone') {
				$('#confirm_sms_remain_time').html(minute + ':' + second_text);
			} else {
				$('#confirm_mail_remain_time').html(minute + ':' + second_text);
			}
		}

		function lap() {
			if (second == 0 && minute > 0) {
				second = 59;
				minute -= 1;
			} else {
				second -= 1;
			}

			setTimeText(minute, second);

			if (minute == 0 && second == 0) {
				changeConfirmText('warning_txt', '입력시간이 만료되었습니다. 인증번호를 다시 발송해주세요.');
				if ($('.layer_identify.open').attr("id") == 'layer_pop_byphone') {
					confirm_remain_sms_time_area.html('');
				} else {
					confirm_remain_mail_time_area.html('');
				}
				stopConfirmTimer();
			}
		}
	}

	function stopConfirmTimer() {
		if (clearId) {
			clearInterval(clearId);
			clearId = '';
		}
	}

	function changeConfirmText(type, text) {

		if (channel.val() == 'sms') {
			if (phone_confirm_msg.attr('class') == type) {
				phone_confirm_msg.html(text);
				phone_confirm_msg.show();
			} else {
				phone_confirm_msg.removeClass().addClass(type).html(text);
				phone_confirm_msg.show();
			}
		} else {
			if (email_confirm_msg.attr('class') == type) {
				email_confirm_msg.html(text);
				email_confirm_msg.show();
			} else {
				email_confirm_msg.removeClass().addClass(type).html(text);
				email_confirm_msg.show();
			}
		}
	}

	function checkNumberOnly(e) {
		var evt = e || window.event;

		if (!evt.keyCode || evt.keyCode == 0) {
			var code = evt.charCode;
		} else {
			var code = evt.keyCode;
		}

		if ((48 <= code && code <= 57)
			|| code == 8
			|| code == 190
			|| code == 9
		) {
		} else {
			var agent = navigator.userAgent.toLowerCase();
			if ((navigator.appName === 'Netscape' && agent.indexOf('trident') !== -1) || (agent.indexOf("msie") !== -1)) {
				evt.returnValue = false;
			} else {
				evt.preventDefault();
				evt.stopPropagation();
			}
		}
	}

	function confirmComplete(form) {
		var form = $(form);
		if (channel.val() == 'sms') {
			if (sms_confirm_complete.val() == 'y') {
				form.submit();
			}
		} else {
			if (mail_confirm_complete.val() == 'y') {
				form.submit();
			}
		}
	}

	changeConfirmCell = function(mode) {
		if (mode === 'sms') {
			if (sms_confirm_complete.val() === 'y') {
				$('input[name="tmp_cellnum"]').attr('readonly', true);
				already_phone_join_check();
				$('.layer_identify.open').removeClass('open');
				cellnum.attr('readonly', true);
				confirm_status.val('complete');
				confirm_method.val('7');
				certi_phone1.val($('#cell1').val());
				certi_phone2.val(cellnum.val());
				$('#confirm_good_txt').show();
			} else {
				alert('인증을 완료하세요.');
			}
		} else {
			if (mail_confirm_complete.val() === 'y') {
				$('input[name="tmp_email_id"]').attr('readonly', true);
				already_email_join_check();
				$('.layer_identify.open').removeClass('open');
				email_id.attr('readonly', true);
				email_dm.attr('readonly', true);
				confirm_status.val('complete');
				confirm_method.val('11');
				list_mail.hide();
				$('#confirm_good_txt').show();
			} else {
				alert('인증을 완료하세요.');
			}
		}
	};

	already_email_join_check = function() {
		var email = email_id.val() + '@' + email_dm.val();

		$.ajax({
			data: {
				'seq': $('#seq').val()
				, 'confirm_status': 'complete'
				, 'user_nm': $('#user_nm').val()
				, 'birth_year': $('#birth_year').val()
				, 'birth_month': $('#birth_month').val()
				, 'birth_day': $('#birth_day').val()
				, 'email': email
			}
			, dataType: 'json'
			, type: 'post'
			, url: '/zf_user/member/registration/already-email-join-check'
			, success: function(response, status, request) {
				if (status == 'success' && response != '') {
					$('#p_already_id').text(response);
					$('#p_member_nudge').show();
				}
			},
			error: function(e) {
				if (window.console) {
					console.log(e);
				}
			},
			complete: function() {

			}
		});
	};

	already_phone_join_check = function() {

		var user_nm = $('#user_nm').val(),
			birth_year = $('#birth_year').val(),
			birth_month = $('#birth_month').val(),
			birth_day = $('#birth_day').val(),
			cell1 = $('#cell1').val(),
			cell2 = $('#cell2').val(),
			cell3 = $('#cell3').val()
			;

		if (user_nm === '' || birth_year === '' || birth_month === '' || birth_day === '' ||
			cell1 === '' || cell2 === '' || cell3 === '') {
			return;
		}

		$.ajax({
			data: {
				'seq': $('#seq').val()
				, 'confirm_status': 'complete'
				, 'user_nm': user_nm
				, 'birth_year': birth_year
				, 'birth_month': birth_month
				, 'birth_day': birth_day
				, 'cell1': cell1
				, 'cell2': cell2
				, 'cell3': cell3
			}
			, dataType: 'json'
			, type: 'post'
			, url: '/member/check'
			, success: function(response, status, request) {
				if (status === 'success' && response !== '') {
					$('#p_already_id').text(response);
					$('#p_member_nudge').show();
				}
			},
			error: function(e) {
				if (window.console) {
					console.log(e);
				}
			},
			complete: function() {

			}
		});
	};

	var $btn_pop = $('.btn_cert_pop');

	confirm_layer_close = function(obj) {
		if (!confirm('인증을 하지 않으면 회원가입을 하실 수 없어요.\n그래도 창을 닫으시겠어요?\n(창을 닫으시면 현재 발송된 인증번호는 더 이상 사용하실 수 없습니다.)')) {
			return;
		}
		stopConfirmTimer();
		$btn_pop.removeClass('on');
		if (channel.val() === 'sms') {
			sms_confirm_complete.val('n');
			cellnum.attr('readonly', false);
			pop_byemail.attr('disabled', false);
			confirm_status.val('send');
			pop_byphone.attr('disabled', false);
			pop_byemail.attr('disabled', false);
			$('.certi_list').removeClass('afterCert');
			sms_code.attr('readonly', false);
			sms_code.val('');
			phone_confirm_msg.hide();
			confirm_remain_sms_time_area.html('');
		} else {
			mail_confirm_complete.val('n');
			email_id.attr('readonly', false);
			email_dm.attr('readonly', false);
			pop_byphone.attr('disabled', false);
			confirm_status.val('send');
			pop_byphone.attr('disabled', false);
			pop_byemail.attr('disabled', false);
			list_mail.show();
			email_code.attr('readonly', false);
			email_code.val('');
			email_confirm_msg.hide();
			confirm_remain_mail_time_area.html('');
		}
		$(obj).closest('.layer_identify').removeClass('open');
	};


	$btn_pop.on('click', function() {
		$btn_pop.removeClass('active');
		$(this).addClass('active');
		$('#' + $(this).data('popupid')).addClass('open');

		if ($('#' + $(this).data('popupid')).css("display") === 'none') {
			$('#' + $(this).data('popupid')).css("display", '')
		}

		if ($('.layer_identify.open').attr("id") === 'layer_pop_byphone') {
			if (sms_confirm_complete.val() === 'y' || mail_confirm_complete.val() === 'y') {
				layer_pop_byphone.removeClass('open');
				if (mail_confirm_complete.val() === 'y') {
					pop_byphone.removeClass('active');
					pop_byemail.addClass('active');
				}
				alert("인증이 이미 완료되었습니다.");
				return;
			}
		} else {
			if (sms_confirm_complete.val() === 'y' || mail_confirm_complete.val() === 'y') {
				layer_pop_byemail.removeClass('open');
				if (sms_confirm_complete.val() === 'y') {
					pop_byemail.removeClass('active');
					pop_byphone.addClass('active');
				}
				alert("인증이 이미 완료되었습니다.");
				return;
			}
		}

		if (sendCodeAction()) {
			layerPopupText();
		} else {
			$('#sms_layer_sub_title').text('인증번호를 보낼 수가 없습니다.');
			$('#email_layer_sub_title').text('인증번호를 보낼 수가 없습니다.');
		}
	});

	// 인증번호 발송.
	sendCodeAction = function() {
		if ($('.layer_identify.open').attr("id") === 'layer_pop_byphone') {

			if (overseas_fl.val() == '1') {
				layer_pop_byphone.removeClass('open');
				pop_byphone.removeClass('active');
				alert('이메일 인증을 이용해주세요.');
				return;
			}

			if (sms_confirm_complete.val() === 'y') {
				alert("인증이 이미 완료되었습니다. 인증완료 버튼을 눌러주세요.");
				return;
			}

			channel.val('sms');
		} else {

			email_id = $('#' + channel.val() + '_email_id');
			var email_str = email_id.val();
			//메일정상여부
			if (!/^[0-9a-z_+-]+([\.]*[0-9a-z_+-])*@([0-9a-z_-]+\.)+[a-z]{2,10}$/i.test(email_str)) {
				layer_pop_byemail.removeClass('open');
				pop_byemail.removeClass('active');
				email_id.focus();
				alert("잘못된 이메일 주소입니다. 이메일 주소를 정확하게 입력해주세요.");
				return;
			}

			if (email_id.val() === '') {
				layer_pop_byemail.removeClass('open');
				pop_byemail.removeClass('active');
				email_id.focus();
				alert("이메일 주소를 다시 확인해주세요.");
				return;
			}

			if (mail_confirm_complete.val() === 'y') {
				alert("인증이 이미 완료되었습니다. 인증완료 버튼을 눌러주세요.");
				return;
			}

			channel.val('mail');
		}

		var cellNum = $('#' + channel.val() + '_cellnum').val().replace(/-/g, "");
		var cellLen = cellNum.length;
		var cell = '',
			email = '';

		if (overseas_fl.val() === '0' && channel.val() === 'sms') {

			if (cellNum === '') {
				layer_pop_byphone.removeClass('open');
				pop_byphone.removeClass('active');
				alert('휴대폰 번호를 입력해 주세요.');
				return;
			}

			if (!$.isNumeric(cellNum)) {
				name_phone_msg.html('휴대폰번호를 정확하게 입력해주세요.').show();
				layer_pop_byphone.removeClass('open');
				pop_byphone.removeClass('active');
				alert('잘못된 휴대폰 번호입니다. 휴대폰 번호를 정확하게 입력해주세요.');
				return;
			}

			if (cellLen === 10) {
				cell1.val(cellNum.substr(0, 3));
				cell2.val(cellNum.substr(3, 3));
				cell3.val(cellNum.substr(6));
			} else if (cellLen === 11) {
				cell1.val(cellNum.substr(0, 3));
				cell2.val(cellNum.substr(3, 4));
				cell3.val(cellNum.substr(7));
			} else {
				phone_msg_good.hide();
				confirm_remain_time_zone.hide();
				confirm_remain_time_area.hide();
				cellnum.focus();
				name_phone_msg.html('잘못된 휴대폰 번호입니다. 휴대폰 번호를 정확하게 입력해주세요.').show();
				pop_byphone.removeClass('active');
				if ($('.layer_identify.open').attr("id") === 'layer_pop_byphone') {
					layer_pop_byphone.removeClass('open');
				} else {
					layer_pop_byemail.removeClass('open');
				}

				alert('잘못된 휴대폰 번호입니다. 휴대폰 번호를 정확하게 입력해주세요.');
				return;
			}

			cell = cell1.val() + '-' + cell2.val() + '-' + cell3.val();
			cellnum.val(cell);
			$('#cell').val(cell);
		} else {
			if (overseas_fl.val() === '1') {
				cell = '';
				cellnum.val('');
				$('#cell').val(cell);
			}
		}

		email = email_id.val();

		var returnBool = true;

		if (sendCodeTimer) {
			clearTimeout(sendCodeTimer);
		}

		sendCodeTimer = setTimeout(function() {
			$.ajax('/zf_user/persons/send-code', {
				type: 'POST',
				data: {
					phone: cell,
					email: email,
					channel: channel.val(),
					needCheckLimit: 'y'
				},
				async: false,
				dataType: 'json',
				success: function(json) {
					if (json.code === 'limit.send') {
						alert(json.msg);
						returnBool = false;
						return changeConfirmText('warning_txt', json.msg);
					}
					if (json === "invalid_phone") {
						returnBool = false;
						return changeConfirmText('warning_txt', '휴대폰번호가 올바르지 않습니다.');
					}
					if (json === "invalid_email") {
						returnBool = false;
						return changeConfirmText('warning_txt', '이메일주소가 올바르지 않습니다.');
					}
					if (json.code === "certification_notice") {
						returnBool = false;
						return changeConfirmText('warning_txt', "일시적인 오류로 인하여 " + json.message + " 이용이 불가능합니다. 잠시 후 다시 이용해주세요.");
					}
					startConfirmTimer();
					return true;
				}

			})
		}, 300);

		return returnBool;
	};

	// 인증 번호 발송 후 텍스트 처리
	layerPopupText = function() {
		if ($('.layer_identify.open').attr("id") == 'layer_pop_byphone') {
			var cellNum = $('#sms_cellnum').val().replace(/-/g, "");
			var cellLen = cellNum.length;

			if (cellLen === 10) {
				cell1.val(cellNum.substr(0, 3));
				cell2.val(cellNum.substr(3, 3));
				cell3.val(cellNum.substr(6));
			} else if (cellLen === 11) {
				cell1.val(cellNum.substr(0, 3));
				cell2.val(cellNum.substr(3, 4));
				cell3.val(cellNum.substr(7));
			}

			var cell = cell1.val() + '-' + cell2.val() + '-' + cell3.val();

			$('#sms_layer_sub_title').html(cell + '로 인증번호가 발송되었습니다.' + '<br />' + '카카오톡으로 전달받은 인증번호를 입력해주세요.' + '<br />' + '(실패 시 SMS 전송)');
			sms_code.focus();
		} else {
			email_id = $('#' + channel.val() + '_email_id');
			var email = email_id.val();
			$('#email_layer_sub_title').html(email + '로 인증번호가 발송되었습니다.' + '<br />' + '이메일로 전달받은 인증번호를 입력해주세요.');
			email_code.focus();
		}
	};

	$('.confirm-action.person').on('click', function(e) {

		if ($('.layer_identify.open').attr("id") === 'layer_pop_byphone') {
			if (sms_confirm_complete.val() === 'y') {
				alert("인증이 이미 완료되었습니다. 인증완료 버튼을 눌러주세요.");
				return;
			}
			channel.val('sms');
		} else {
			if (mail_confirm_complete.val() == 'y') {
				alert("인증이 이미 완료되었습니다. 인증완료 버튼을 눌러주세요.");
				return;
			}
			channel.val('mail');
		}

		var cellNum = $('#' + channel.val() + '_cellnum').val().replace(/-/g, "");
		var cellLen = cellNum.length;

		var cell = '',
			email = '',
			send_code = '';


		if (overseas_fl.val() == "0" && channel.val() === 'sms') {
			if (!$.isNumeric(cellNum)) {
				changeConfirmText('warning_txt', '휴대폰번호를 정확하게 입력해주세요.');
				return;
			}

			if (cellLen === 10) {
				cell1.val(cellNum.substr(0, 3));
				cell2.val(cellNum.substr(3, 3));
				cell3.val(cellNum.substr(6));
			} else if (cellLen === 11) {
				cell1.val(cellNum.substr(0, 3));
				cell2.val(cellNum.substr(3, 4));
				cell3.val(cellNum.substr(7));
			} else {
				phone_msg_good.hide();
				confirm_remain_time_zone.hide();
				confirm_remain_time_area.hide();
				cellnum.focus();
				phone_msg.html('잘못된 휴대폰 번호입니다. 휴대폰 번호를 정확하게 입력해주세요.').show();
				alert('잘못된 휴대폰 번호입니다. 휴대폰 번호를 정확하게 입력해주세요.');
				return;
			}

			cell = cell1.val() + '-' + cell2.val() + '-' + cell3.val();
			cellnum.val(cell);
			$('#cell').val(cell);
		} else {
			if (overseas_fl.val() === '1') {
				cell = '';
				cellnum.val('');
				$('#cell').val(cell);
			}
		}

		email_id = $('#' + channel.val() + '_email_id');
		email = email_id.val();

		if ($('.layer_identify.open').attr("id") === 'layer_pop_byphone') {
			sms_code.val($.trim(sms_code.val()));
			send_code = sms_code.val();
		} else {
			email_code.val($.trim(email_code.val()));
			send_code = email_code.val();
		}

		if (send_code === '') {
			changeConfirmText('warning_txt', '인증번호를 입력해주세요.');
			return;
		}

		$.ajax({
			url: '/zf_user/persons/validate-code',
			type: 'POST',
			data: {
				category: 'join',
				seq: $('#seq').val(),
				code: send_code,
				channel: channel.val(),
				phone: cell,
				email: email
			},
			dataType: 'json',
			success: function(json) {
				if (json === 'limit.cert') {
					alert('본인 인증이 5회 이상 실패하여 24시간 동안 인증이 제한됩니다.\n제한해제를 원하실 경우, 고객센터로 문의해주세요.');
					stopConfirmTimer();
					return false;
				}

				if (json === 'confirms.verified') {
					stopConfirmTimer();
					if (channel.val() === 'sms') {
						sms_confirm_complete.val('y');
						mail_confirm_complete.val('n');
						sms_code.attr('readonly', true);
						confirm_remain_sms_time_area.html('');
					} else {
						sms_confirm_complete.val('n');
						mail_confirm_complete.val('y');
						email_code.attr('readonly', true);
						confirm_remain_mail_time_area.html('');
						if ($('#id').val() === '') {
							idExsistCheck(email.split('@')[0]);
						}
					}
					$('.btn_cert_pop').addClass('on');
					changeConfirmText('good_txt', '인증되었습니다.');
					return;
				}
				// confirms.invalid_token
				if (channel.val() === 'sms') {
					sms_confirm_complete.val('n');
				} else {
					mail_confirm_complete.val('n');
				}

				changeConfirmText('warning_txt', '인증번호가 틀렸습니다. 다시 입력해주세요.');
			},
			error: function(error) {
				stopConfirmTimer();
				changeConfirmText('warning_txt', '인증번호 확인 오류. 다시 확인해주세요.');
			}

		});
	});

	$('div.log').ajaxError(function(event, xhr, settings, thrownEvent) {
		if (window.console) {
			console.log(event);
			console.log(thrownEvent);
		}
	});

	set_overseas_selective = function() {

		var $channel = $('#channel');
		var $identify_mail = $('.identify_mail');
		$('p[name="msg_phone"]').hide();

		if (overseas_fl.val() === "1") {
			if (sms_confirm_complete.val() === 'y') {
				confirm_status.val('ready');
			}
			collectionBasisContentsOverseas.hide();
			overseas_fl.val('0');
			sms_confirm_complete.val('n');
			certi_phone1.attr('onfocus', '');
			certi_phone2.attr('onfocus', '');
			cellnum.attr('readonly', false);
			pop_byemail.attr('disabled', false);
			pop_byphone.attr('disabled', false);
			phone_certi_list.removeClass('afterCert');
			phone_certi_list.addClass('must');
			sms_code.attr('readonly', false);
			sms_code.val('');
			phone_confirm_msg.hide();
			confirm_remain_sms_time_area.html('');
		} else {

			if ($channel.val() === 'sms') {
				if (sms_confirm_complete.val() === 'y') {
					alert('인증이 이미 완료되었습니다');
					return false;
				}
				$channel.val('mail');
				alert('해외거주자는 이메일 인증을 이용해 주세요.');
				$('.identify_phone').hide();
				$identify_mail.show();
				sms_confirm_complete.val('n');
				$('.btn_identify_check').removeClass('on');
				$identify_mail.find('.check_custom').eq(0).click();
				return false;
			}

			collectionBasisContentsOverseas.show();
			overseas_fl.val('1');
			sms_confirm_complete.val('n');
			cellnum.val('');
			pop_byphone.removeClass('active');
			pop_byemail.attr('disabled', false);
			phone_certi_list.removeClass('must');
			phone_certi_list.addClass('afterCert');
			certi_phone1.attr('onfocus', 'this.blur()');
			certi_phone2.attr('onfocus', 'this.blur()');
			phone_confirm_msg.hide();
			phone_msg.hide();
			confirm_remain_sms_time_area.html('');
			certi_phone1.val('');
			certi_phone2.val('');
			if (mail_confirm_complete.val() === 'n') {
				confirm_status.val('ready');
				$('#confirm_good_txt').hide();
			}
		}
	};

	if ($('.dimmed.open').length) {
		$('body').css('overflow', 'hidden');
	}


	$('.identify_select.person > .btn_identify').on('click', function() {
		var id = this.id;
		var $identify_mail = $('.identify_mail');
		var $identify_phone = $('.identify_phone');
		var $common_identify = $('.common_identify');
		var $ignore_cell_1 = $('#ignore_cell_1');
		var $incident_phone = $('._incident_phone');
		var $incident_email = $('._incident_email');

		if ($('.layer_identify').is(':visible')) {
			return;
		}

		if (sms_confirm_complete.val() === 'y' || mail_confirm_complete.val() === 'y') {
			layer_pop_byemail.removeClass('open');
			layer_pop_byphone.removeClass('open');
			alert('인증이 이미 완료되었습니다.');
			return;
		}

		if ($('#overseas_fl').val() === '1' && id === 'identify_phone') {
			alert('해외거주자는 이메일 인증을 이용해 주세요.');
			id = 'identify_email';
		}


		// 해외거주 초기화
		$ignore_cell_1.prop('checked', false);
		$ignore_cell_1.closest('label').get(0).className = 'check_custom check_off';

		$identify_phone.hide();
		$identify_mail.hide();
		$common_identify.hide();

		if (id === 'identify_phone') {
			if ($incident_phone.length > 0) {
				$incident_phone.show();
				$(':focus').blur();
				return;
			}
			$identify_phone.show();
			channel.val('sms');
		} else {
			if ($incident_email.length > 0) {
				$incident_email.show();
				$(':focus').blur();
				return;
			}
			$('._email').show();
			$identify_mail.show();
			channel.val('mail');
		}
		$common_identify.show();

	});

	$('.identify_company > .btn_identify').on('click', function() {

		if (sms_confirm_complete.val() === 'y' || mail_confirm_complete.val() === 'y' || ipin_confirm_complete.val() === 'y') {
			layer_pop_byemail.removeClass('open');
			alert('인증이 이미 완료되었습니다.');
			return;
		}

		var $identify_mail = $('.identify_mail');
		var $identify_phone = $('.identify_phone');
		var $identify_pin = $('.identify_pin');
		var $incident_phone = $('._incident_phone');
		var $incident_email = $('._incident_email');
		var $incident_ipin = $('._incident_ipin');

		$identify_phone.hide();
		$identify_mail.hide();
		$identify_pin.hide();

		if (this.id === 'identify_phone') {
			if ($incident_phone.length > 0) {
				$incident_phone.show();
				$(':focus').blur();
				return;
			}
			popupCertify(document.getElementById('certify-form'));
			//$identify_phone.show();
			channel.val('sms');
			setManagerClear();
		} else if (this.id === 'identify_pin') {
			if ($incident_ipin.length > 0) {
				$incident_ipin.show();
				$(':focus').blur();
				return;
			}
			popupIpin(document.getElementById('ipin-form'));
			//$identify_pin.show();
			channel.val('ipin');
			setManagerClear();
		} else {
			if ($incident_email.length > 0) {
				$incident_email.show();
				$(':focus').blur();
				return;
			}
			$identify_mail.show();
			channel.val('mail');
			setManagerClear();
		}

	});

	function setManagerClear() {
		$('p[name="msg_email1"]').hide();
		$('p[name="msg_corp_charge"]').hide();
		$('p[name="msg_phone"]').hide();
		$('input[name="email_id"]').val('');
		$('input[name="manager_nm"]').val('');
		$('input[name="cellnum"]').val('');
	}

	$('#btn_mail_identify').on('click', function() {

		$('.email_list').hide();

		if (sms_confirm_complete.val() === 'y' || mail_confirm_complete.val() === 'y' || ipin_confirm_complete.val() === 'y') {
			alert('인증이 이미 완료되었습니다.');
			return;
		}

		var $mail_email_id = $('#mail_email_id'),
			email_str = $mail_email_id.val(),
			$layer = $('#layer_pop_byemail'),
			$email_status = $('#email_status'),
			channel_val = $('#channel').val()
			;

		$('#' + channel_val + '_msg_email2').hide();
		//이메일 계정이 없거나, 메일 선택이 없을때
		if (email_str === '') {
			alert('이메일 주소를 입력해주세요.');
			return false;
		}

		if (!isPregEmail(email_str)) {
			alert('이메일 주소를 다시 확인해주세요');
			$mail_email_id.focus();
			$('#' + channel_val + '_msg_email1').text('이메일 주소를 다시 확인해주세요').show();
			return false;
		}

		$('#email').val(email_str);

		$.ajax({
			data: { 'email': email_str }
			, dataType: 'json'
			, type: 'post'
			, url: '/zf_user/member/registration/ajax-company-email-check'
			, success: function(response) {
				var result = response.result;

				if (result === 'success') {
					$email_status.val('y');
					// $('#confirmFlag').val('y');
					$('#' + channel_val + '_msg_email2').text('사용 가능한 이메일입니다.').show();

					$layer.addClass('open');

					companySendCodeAction();

					channel.val('mail');
					$('#email_layer_sub_title').html(email_str + '로 인증번호가 발송되었습니다.' + '<br />' + '이메일로 전달받은 인증번호를 입력해주세요.');
					setLogScript('manager-info', 'e-mail', 'Email_input', 'Email_check');
					email_code.focus();
				} else {
					$email_status.val('n');
					$('#' + channel_val + '_msg_email1').text('이미 사용중인 이메일 주소입니다.').show();

					$('#p_already_id').text(response.duplicate_id);
					$('#p_member_nudge').show()
				}

			}
		});


	});


	var companySendCodeAction = function() {

		var $email_id = $('#mail_email_id');
		var email = $email_id.val();

		if (!isPregEmail(email)) {
			$('body').css('overflow', '');
			layer_pop_byemail.removeClass('open');
			$email_id.focus();
			return alert("잘못된 이메일 주소입니다. 이메일 주소를 정확하게 입력해주세요.");
		}
		if (mail_confirm_complete.val() === 'y') {
			return alert("인증이 이미 완료되었습니다. 인증완료 버튼을 눌러주세요.");
		}
		channel.val('mail');

		// if (overseas_fl.val() == '1' && channel.val() != 'sms') {
		//     $('#cell1').val('');
		//     $('#cell2').val('');
		//     $('#cell3').val('');
		//     cellnum.val('');
		// }

		$.ajax('/zf_user/member/registration/send-code', {
			type: 'POST',
			data: {
				phone: '',
				email: email,
				channel: channel.val(),
				needCheckLimit: 'y'
			},
			dataType: 'json',
			success: function(json) {
				if (json.code === 'limit.send') {
					alert(json.msg);
					returnBool = false;
					return changeConfirmText('warning_txt', json.msg);
				}
				if (json == "invalid_phone") {
					return changeConfirmText('warning_message', '휴대폰번호가 올바르지 않습니다.');
				}
				if (json == "invalid_email") {
					return changeConfirmText('warning_message', '이메일주소가 올바르지 않습니다.');
				}
				if (json.code == "certification_notice") {
					return changeConfirmText('warning_message', "일시적인 오류로 인하여 " + json.message + " 이용이 불가능합니다. 잠시 후 다시 이용해주세요.");
				}
				startConfirmTimer();
				return true;
			},
			error: function(e) {
				if (window.console) {
					console.log(e);
				}
			},
			complete: function() {
			}
		});

	};

	$('.confirm-action.company').on('click', function(e) {

		if (mail_confirm_complete.val() === 'y') {
			alert("인증이 이미 완료되었습니다. 인증완료 버튼을 눌러주세요.");
			return;
		}
		channel.val('mail');

		email_id = $('#mail_email_id');
		var email = email_id.val();

		email_code.val($.trim(email_code.val()));
		var send_code = email_code.val();

		if (send_code === '') {
			changeConfirmText('warning_message', '인증번호를 입력해주세요.');
			return false;
		}

		$.ajax({
			url: '/zf_user/persons/validate-code',
			type: 'POST',
			data: {
				category: 'join',
				seq: $('#seq').val(),
				code: send_code,
				channel: channel.val(),
				phone: '',
				email: email
			},
			dataType: 'json',
			success: function(json) {
				if (json === 'confirms.verified') {
					stopConfirmTimer();
					sms_confirm_complete.val('n');
					mail_confirm_complete.val('y');
					email_code.attr('readonly', true);
					confirm_remain_mail_time_area.html('');
					$('#btn_mail_identify').addClass('on');
					$('input[name="email_id"]').attr('readonly', true);
					changeConfirmText('info_message', '인증되었습니다.');
					idExsistCheck(email.split('@')[0]);
					return;
				}
				// confirms.invalid_token
				mail_confirm_complete.val('n');
				changeConfirmText('warning_message', '인증번호가 틀렸습니다. 다시 입력해주세요.');
			},
			error: function(error) {
				stopConfirmTimer();
				changeConfirmText('warning_message', '인증번호 확인 오류. 다시 확인해주세요.');
			}
		});
	});

	function isPregEmail(email_str) {
		return /^[0-9a-z._+-]+@([0-9a-z_-]+\.)+[a-z]{2,10}$/i.test(email_str);
	}

	function popupCertify(form) {
		//if ( $('#c_frm').find('#tc_1_fl').val() == 'n' ||  $(c_frm).find('#tc_2_fl').val() == 'n' || !$(c_frm).find('#phone_cert').is(":checked") ) {
		// if ( !$(c_frm).find('#phone_cert').is(":checked") ) {
		//     alert('휴대폰 인증 항목에 동의해주세요.');
		//     return false;
		// }

		window.name = "Parent_window";
		var win = window.open('about:blank', 'popupCertify_2', 'width=500, height=461, top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbar=no');
		win.blur();
		form.target = "popupCertify_2";
		form.submit();
		win.focus();
	}

	function popupIpin(form) {
		/*
		 if ( $('#c_frm').find('#tc_1_fl').val() == 'n' ||  $(c_frm).find('#tc_2_fl').val() == 'n' ) {
		 alert('약관에 동의해 주세요.');
		 return false;
		 }
		 */
		window.name = "Parent_window";
		var win = window.open('about:blank', 'popupIpin_2', 'width=450, height=550, top=100, left=100, fullscreen=no, menubar=no, status=no, toolbar=no, titlebar=yes, location=no, scrollbar=no');
		win.blur();
		form.target = "popupIpin_2";
		form.submit();
		win.focus();
	}

});
/**
 * Password Strength Class
 *
 * @author xhunter 2013 패스워드정책강화
 * @date 2013-09-06
 * @version $Id$
 */


var PasswordStrength = {
	_message: "",
	strengthHash: {
		0: "",
		1: "사용불가 (안전성 강도 매우 약함)",
		2: "사용불가 (안전성 강도 약함)",
		3: "사용가능한 비밀번호입니다. (안전성 강도 보통)",
		4: "사용가능한 비밀번호입니다. (안전성 강도 강함)",
		5: "사용가능한 비밀번호입니다. (안전성 강도 매우 강함)"
	},
	messages: {
		"base": "8~16자리 영문 대소문자, 숫자, 특수문자 중 3가지 이상 조합",
		"equalid": "아이디와 동일한 비밀번호는 사용할 수 없습니다.",
		"equalold": "현재 사용중인 비밀번호는 사용할 수 없습니다.",
		"repeat": "3자리 이상 반복되는 영문, 숫자, 특수문자는 비밀번호로 사용할 수 없습니다.",
		"consecutive": "3자리 이상 연속되는 영문, 숫자, 특수문자는 비밀번호로 사용할 수 없습니다.",
		"blank": ""
	},
	isValid: function() {
	},
	getMessage: function() {
		return this._message;
	},
	getStrength: function() {
		return this.strengthHash[this._lv];
	},
	verify: function(passwd, old, user_id) {
		var len = passwd.length,
			score = 0;

		if (/^\s*$/.test(passwd)) {
			this._message = "비밀번호를 입력해 주십시오";
			this._lv = 0;
			return false;
		}

		if (user_id && user_id === passwd) {
			this._message = this.messages.equalid;
			this._lv = 1;
			return false;
		}

		if (old && old === passwd) {
			this._message = this.messages.equalold;
			this._lv = 1;
			return false;
		}


		// 동일 문자 및 연속된 문자 확인
		var sameword = 0;
		var step = 0;
		var rStep = 0;
		var word1, word2, i;

		for (i = 0; i < len - 1; i++) {
			word1 = passwd.substr(i, 1);
			word2 = passwd.substr(i + 1, 1);

			if (word1 === word2) {
				sameword++;
			} else if (sameword < 2) {
				sameword = 0;
			}

			if (word1.charCodeAt(0) === word2.charCodeAt(0) - 1) {
				step++;
			} else if (step < 2) {
				step = 0;
			}

			if (word1.charCodeAt(0) === word2.charCodeAt(0) + 1) {
				rStep++;
			} else if (rStep < 2) {
				rStep = 0;
			}
		}

		if (sameword >= 2) {
			// 3자리 이상 반복되는 영문, 숫자, 특수문자는 사용할 수 없습니다.
			this._message = this.messages.repeat;
			this._lv = 1;
			return false;
		}
		if (step >= 2) {
			// 3자리 이상 연속되는 영문, 숫자, 특수문자는 사용할 수 없습니다.
			this._message = this.messages.consecutive;
			this._lv = 1;
			return false;
		}
		if (rStep >= 2) {
			// 3자리 이상 연속되는 영문, 숫자, 특수문자는 사용할 수 없습니다.
			this._message = this.messages.consecutive;
			this._lv = 1;
			return false;
		}

		var sSymbols = ")!@#$%^&*()";
		var sRSymbols = "!)(*&^%$#@!";
		/* Check for sequential symbol string patterns (forward and reverse) */
		for (var s = 0; s < 8; s++) {
			var sFwd = sSymbols.substring(s, parseInt(s + 3));
			var sRev = sRSymbols.substring(s, parseInt(s + 3));
			if (passwd.toLowerCase().indexOf(sFwd) !== -1 || passwd.toLowerCase().indexOf(sRev) !== -1) {
				this._message = this.messages.consecutive;
				this._lv = 1;
				return false;
			}
		}

		score++;

		if (len < 8 || len > 16) {
			this._message = this.messages.base;
			this._lv = 1;
			return false;
		}

		score++;


		var nComplexity = 0;
		if (passwd.match(/[A-Z]/)) {
			nComplexity++;
		}
		if (passwd.match(/[a-z]/)) {
			nComplexity++;
		}
		if (passwd.match(/[0-9]/)) {
			nComplexity++;
		}
		if (passwd.match(/[^a-zA-Z0-9]/)) {
			nComplexity++;
		}

		if (nComplexity < 3) {
			this._message = this.messages.base;
			this._lv = 2;
			return false;
		}

		if (nComplexity < 3 && len < 8) {
			// 최소 8자 이상 또는 3종류 이상을 조합하여 비밀번호를 구성하여 주십시오
			this._message = this.messages.base;
			this._lv = 2;
			return false;
		}

		score++;

		if (len > 10 && nComplexity > 2) {
			score++;
		}

		if (len > 12 && nComplexity > 2) {
			score++;
		}

		this._lv = score;
		return true;
	}
}

jQuery(function($) {

	$('.address_main').click(function() {
		new daum.Postcode({
			oncomplete: function(data) { //선택시 입력값 세팅
				$('#postNo').val(data.zonecode);
				$('#addrRef').val(data.bname);
				$('#address_main').val(data.address + "(" + data.bname + ")"); // 주소 넣기
			}
		}).open();
	})

	$('#check_global, #agreeSelectiveGender, #agreeSelectiveAddress').click(function() {
		if ($(this).is(":checked")) {
			$(this).parents("label").addClass('check_on');
			$(this).parents("label").removeClass('check_off');
		} else {
			$(this).parents("label").addClass('check_off');
			$(this).parents("label").removeClass('check_on');
		}
	})

	function Address(postNo, addr, addrDetl, addrRef){
		this.postNo = postNo;
		this.addr = addr;
		this.addrDetl = addrDetl;
		this.addrRef = addrRef;
	}
	
	function Form(userId, userPassword, userName, mobileNo, birth, email, sex, postNo, addr, addrDetl, addrRef) {
        this.userId = userId;
        this.userPassword = userPassword;
        this.userName = userName;
        this.mobileNo = mobileNo;
        this.birth = birth;
        this.email = email;
        this.sex = sex;
        this.address = new Address(postNo, addr, addrDetl, addrRef);
    }
    
	$('#submit').click(function() {
		var temp = 'M';
		
		var form = new Form(
			$('#id').val(),
			$('#password1').val(),
			$('#sms_user_nm').val(),
			$('#sms_cellnum').val(),
			$('#sms_birth_date').val(),
			$('#mail_email_id').val(),
			temp,
			$('#postNo').val(),
			$('#address_main').val(),
			$('#address_sebu').val(),
			$('#addrRef').val()
		);
		console.log(form);
		$.ajax({
			data: JSON.stringify(form),
			dataType: 'json',
			contentType: 'application/json',
			type: 'post',
			url: 'http://localhost:8081/member/join',
			success: function(response, status, request) {
				location.href="/front/index.html";
			},
			error : function(request, status, error ) {   // 오류가 발생했을 때 호출된다. 
				alert(error);
			}
		});
	})
})
