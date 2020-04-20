<script type='text/javascript'>

    $(document).ready(function () {

        //  $("#hid").timepicker();
        $("#start").timepicker({ dateFormat: 'yy-mm-dd', timeFormat: 'hh:mm', hourMin: 5, hourMax: 24, hourGrid: 3, minuteGrid: 15, timeText: '时间', hourText: '时', minuteText: '分', timeOnlyTitle: '选择时间', onClose: function (dateText, inst) {
            if ($('#start').val() != '') {
                var testStartDate = $('#start').datetimepicker('getDate');
                var testEndDate = $('#end').datetimepicker('getDate');
                if (testStartDate > testEndDate)
                    $('#end').datetimepicker('setDate', testStartDate);
            } else {
                $('#end').val(dateText);
            }
        },
            onSelect: function (selectedDateTime) {
                $('#end').datetimepicker('option', 'minDate', $('#end').datetimepicker('getDate'));
          //  }
       // });
        $("#end").datetimepicker({ dateFormat: 'yy-mm-dd', hourMin: 5, hourMax: 23, hourGrid: 3, minuteGrid: 15, timeText: '时间', hourText: '时', minuteText: '分', onClose: function (dateText, inst) {
            if ($('#start').val() != '') {
                var testStartDate = $('#start').datetimepicker('getDate');
                var testEndDate = $("#end").datetimepicker('getDate');
                if (testStartDate > testEndDate)
                    $('#start').datetimepicker('setDate', testEndDate);
            } else {
                $('#start').val(dateText);
            }
        },
            onSelect: function (selectedDateTime) {
                $('#start').timepicker('option', 'maxDate', $("#end").timepicker('getDate'));
            }
        });
        $("#addhelper").hide();

        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        $('#calendar').fullCalendar({
            theme: true,
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
         
            monthNames: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            monthNamesShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
            today: ["今天"],
            firstDay: 1,
            buttonText: {
                today: '本月',
                month: '月',
                week: '周',
                day: '日',
                prev: '上一月',
                next: '下一月'
            },
            viewDisplay: function (view) {//动态把数据查出，按照月份动态查询
                var viewStart = $.fullCalendar.formatDate(view.start, "yyyy-MM-dd HH:mm:ss");
                var viewEnd = $.fullCalendar.formatDate(view.end, "yyyy-MM-dd HH:mm:ss");
                $("#calendar").fullCalendar('removeEvents');
                $.post("http://www.cnblogs.com/sr/AccessDate.ashx", { start: viewStart, end: viewEnd }, function (data) {
            
                    var resultCollection = jQuery.parseJSON(data);
                    $.each(resultCollection, function (index, term) {
                        $("#calendar").fullCalendar('renderEvent', term, true);
                    });

                }); //把从后台取出的数据进行封装以后在页面上以fullCalendar的方式进行显示
            },
            editable: true,//判断该日程能否拖动
            dayClick: function (date, allDay, jsEvent, view) {//日期点击后弹出的jq ui的框，添加日程记录
                var selectdate = $.fullCalendar.formatDate(date, "yyyy-MM-dd");//选择当前日期的时间转换
                $("#end").datetimepicker('setDate', selectdate);//给时间空间赋值
                $("#reservebox").dialog({
                    autoOpen: false,
                    height: 450,
                    width: 400,
                    title: 'Reserve meeting room on ' + selectdate,
                    modal: true,
                    position: "center",
                    draggable: false,
                    beforeClose: function (event, ui) {
                        //$.validationEngine.closePrompt("#meeting");
                        //$.validationEngine.closePrompt("#start");
                        //$.validationEngine.closePrompt("#end");
                    },
                    timeFormat: 'HH:mm{ - HH:mm}',

                    buttons: {
                        "close": function () {
                            $(this).dialog("close");
                        },
                        "reserve": function () {

                            var startdatestr = $("#start").val(); //开始时间
                            var enddatestr = $("#end").val(); //结束时间
                            var confid = $("#title").val(); //标题
                            var det = $("#details").val(); //内容 
                            var cd = $("#chengdu").val(); //重要程度 
                            var id2;
                            var startdate = $.fullCalendar.parseDate(selectdate + "T" + startdatestr);//时间和日期拼接
                            var enddate = $.fullCalendar.parseDate(enddatestr);
                            var schdata = { title: confid, fullname: confid, description: det, confname: cd, confshortname: 'M1', start: selectdate + ' ' + startdatestr, end: enddatestr };
                            $.ajax({
                                type: "POST", //使用post方法访问后台

                                url: "http://www.cnblogs.com/sr/getallid.ashx", //要访问的后台地址
                                data: schdata, //要发送的数据
                                success: function (data) {
                                    //对话框里面的数据提交完成，data为操作结果
                                    id2 = data;
                                    var schdata2 = { title: confid, fullname: confid, description: det, confname: cd, confshortname: 'M1', start: selectdate + ' ' + startdatestr, end: enddatestr, id: id2 };
                                    $('#calendar').fullCalendar('renderEvent', schdata2, true);
                                    $("#start").val(''); //开始时间
                                    $("#end").val(''); //结束时间
                                    $("#title").val(''); //标题
                                    $("#details").val(''); //内容 
                                    $("#chengdu").val(''); //重要程度 

                                }
                            });


                            $(this).dialog("close");


                        }

                    }
                });
                $("#reservebox").dialog("open");
                return false;
            },
     
            loading: function (bool) {
                if (bool) $('#loading').show();
                else $('#loading').hide();
            },
            eventAfterRender: function (event, element, view) {//数据绑定上去后添加相应信息在页面上
                var fstart = $.fullCalendar.formatDate(event.start, "HH:mm");
                var fend = $.fullCalendar.formatDate(event.end, "HH:mm");
               

                var confbg = '';
                if (event.confid == 1) {
                    confbg = confbg + '<span class="fc-event-bg"></span>';
                } else if (event.confid == 2) {
                    confbg = confbg + '<span class="fc-event-bg"></span>';
                } else if (event.confid == 3) {
                    confbg = confbg + '<span class="fc-event-bg"></span>';
                } else if (event.confid == 4) {
                    confbg = confbg + '<span class="fc-event-bg"></span>';
                } else if (event.confid == 5) {
                    confbg = confbg + '<span class="fc-event-bg"></span>';
                } else if (event.confid == 6) {
                    confbg = confbg + '<span class="fc-event-bg"></span>';
                } else {
                    confbg = confbg + '<span class="fc-event-bg"></span>';
                }

              //  var titlebg = '<span class="fc-event-conf" style="background:' + event.confcolor + '">' + event.confshortname + '</span>';

//                if (event.repweeks > 0) {
//                    titlebg = titlebg + '<span class="fc-event-conf" style="background:#fff;top:0;right:15;color:#3974BC;font-weight:bold">R</span>';
//                }

                if (view.name == "month") {//按月份
                    var evtcontent = '<div class="fc-event-vert"><a>';
                    evtcontent = evtcontent + confbg;
                    evtcontent = evtcontent + '<span class="fc-event-titlebg">' + fstart + " - " + fend + event.fullname + '</span>';

                    element.html(evtcontent);
                } else if (view.name == "agendaWeek") {//按周
                    var evtcontent = '<a>';
                    evtcontent = evtcontent + confbg;
                    evtcontent = evtcontent + '<span class="fc-event-time">' + fstart + "-" + fend  + '</span>';
                    evtcontent = evtcontent + '<span>'+ event.fullname + '</span>';
    
                    element.html(evtcontent);
                } else if (view.name == "agendaDay") {//按日
                    var evtcontent = '<a>';
                    evtcontent = evtcontent + confbg;
                    evtcontent = evtcontent + '<span class="fc-event-time">' + fstart + " - " + fend +  '</span>';
    //              evtcontent = evtcontent + '<span>Room: ' + event.confname + '</span>';
  //                evtcontent = evtcontent + '<span>Host: ' + event.fullname + '</span>';
//                    evtcontent = evtcontent + '<span>Topic: ' + event.topic + '</span>';
                 // evtcontent = evtcontent + '</a><span class="ui-icon ui-icon-arrow-2-n-s"><div class="ui-resizable-handle ui-resizable-s"></div></span>';
                    element.html(evtcontent);
                }
            },
            eventMouseover: function (calEvent, jsEvent, view) {
                var fstart = $.fullCalendar.formatDate(calEvent.start, "yyyy/MM/dd HH:mm");
                var fend = $.fullCalendar.formatDate(calEvent.end, "yyyy/MM/dd HH:mm");
                $(this).attr('title', fstart + " - " + fend + " " + "标题" + " : " + calEvent.title);
                $(this).css('font-weight', 'normal');
                $(this).tooltip({
                    effect: 'toggle',
                    cancelDefault: true
                });
            },

            eventClick: function (event) {
                var fstart = $.fullCalendar.formatDate(event.start, "HH:mm");
                var fend = $.fullCalendar.formatDate(event.end, "HH:mm");
                //  var schdata = { sid: event.sid, deleted: 1, uid: event.uid };
                var selectdate = $.fullCalendar.formatDate(event.start, "yyyy-MM-dd");
                $("#start").val(fstart); ;
                $("#end").datetimepicker('setDate', event.end);


                $("#title").val(event.title); //标题
                $("#details").val(event.description); //内容 
                $("#chengdu").val(event.confname); //重要程度 



                $("#reservebox").dialog({
                    autoOpen: false,
                    height: 450,
                    width: 400,
                    title: 'Reserve meeting room on ',
                    modal: true,
                    position: "center",
                    draggable: false,
                    beforeClose: function (event, ui) {
                        //$.validationEngine.closePrompt("#meeting");
                        //$.validationEngine.closePrompt("#start");
                        //$.validationEngine.closePrompt("#end");
                        $("#start").val(''); //开始时间
                        $("#end").val(''); //结束时间
                        $("#title").val(''); //标题
                        $("#details").val(''); //内容 
                        $("#chengdu").val(''); //重要程度 
                    },
                    timeFormat: 'HH:mm{ - HH:mm}',

                    buttons: {
                        "删除": function () {
                            var aa = window.confirm("警告：确定要删除记录，删除后无法恢复！");
                            if (aa) {
                                var para = { id: event.id };


                                $.ajax({
                                    type: "POST", //使用post方法访问后台

                                    url: "http://www.cnblogs.com/sr/removedate.ashx", //要访问的后台地址
                                    data: para, //要发送的数据
                                    success: function (data) {
                                        //对话框里面的数据提交完成，data为操作结果


                                        $('#calendar').fullCalendar('removeEvents', event.id);
                                    }


                                });

                            }
                            $(this).dialog("close");
                        },
                        "reserve": function () {

                            var startdatestr = $("#start").val(); //开始时间
                            var enddatestr = $("#end").val(); //结束时间
                            var confid = $("#title").val(); //标题
                            var det = $("#details").val(); //内容 
                            var cd = $("#chengdu").val(); //重要程度 
                            var startdate = $.fullCalendar.parseDate(selectdate + "T" + startdatestr);
                            var enddate = $.fullCalendar.parseDate(enddatestr);

                            event.fullname = confid;
                            event.confname = cd;
                            event.start = startdate;
                            event.end = enddate;
                            event.description = det;
                            var id2;

                            var schdata = { title: confid, fullname: confid, description: det, confname: cd, confshortname: 'M1', start: selectdate + ' ' + startdatestr, end: enddatestr, id: event.id };
                            $.ajax({
                                type: "POST", //使用post方法访问后台

                                url: "http://www.cnblogs.com/sr/Updateinfo.ashx", //要访问的后台地址
                                data: schdata, //要发送的数据
                                success: function (data) {
                                    //对话框里面的数据提交完成，data为操作结果

                                    var schdata2 = { title: confid, fullname: confid, description: det, confname: cd, confshortname: 'M1', start: selectdate + ' ' + startdatestr, end: enddatestr, id: event.id };
                                    $('#calendar').fullCalendar('updateEvent', event);
                                }
                            });





                            $(this).dialog("close");
                        }

                    }
                });
                $("#reservebox").dialog("open");
                return false;
            },
            //            events: "http://www.cnblogs.com/sr/AccessDate.ashx"
            events: []
        });



        //goto date function
        if ($.browser.msie) {
            $("#calendar .fc-header-right table td:eq(0)").before('<td><div class="ui-state-default ui-corner-left ui-corner-right" style="border-right:0px;padding:1px 3px 2px;" ><input type="text" id="selecteddate" size="10" style="padding:0px;"></div></td><td><div class="ui-state-default ui-corner-left ui-corner-right"><a><span id="selectdate" class="ui-icon ui-icon-search">goto</span></a></div></td><td><span class="fc-header-space"></span></td>');
        } else {
            $("#calendar .fc-header-right table td:eq(0)").before('<td><div class="ui-state-default ui-corner-left ui-corner-right" style="border-right:0px;padding:3px 2px 4px;" ><input type="text" id="selecteddate" size="10" style="padding:0px;"></div></td><td><div class="ui-state-default ui-corner-left ui-corner-right"><a><span id="selectdate" class="ui-icon ui-icon-search">goto</span></a></div></td><td><span class="fc-header-space"></span></td>');
        }

        $("#selecteddate").datepicker({
            dateFormat: 'yy-mm-dd',
            beforeShow: function (input, instant) {
                setTimeout(
                            function () {
                                $('#ui-datepicker-div').css("z-index", 15);
                            }, 100
                        );
            }
        });



        $("#selectdate").click(function () {
            var selectdstr = $("#selecteddate").val();
            var selectdate = $.fullCalendar.parseDate(selectdstr, "yyyy-mm-dd");
            $('#calendar').fullCalendar('gotoDate', selectdate.getFullYear(), selectdate.getMonth(), selectdate.getDate());
        });


        // conference function
        $("#calendar .fc-header-left table td:eq(0)").before('<td><div class="ui-state-default ui-corner-left ui-corner-right" id="selectmeeting"><a><span id="selectdate" class="ui-icon ui-icon-search" style="float: left;padding-left: 5px; padding-top:1px"></span>meeting room</a></div></td><td><span class="fc-header-space"></span></td>');



        //        $(".fc-button-prev").click(function () {
        //            alert("fasdf");
        //        });
}})
    });


 

</script>