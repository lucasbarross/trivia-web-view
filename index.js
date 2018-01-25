$(document).ready(function(){
    var question;
    var best = 0;
    var right = 0;
    var query = window.location.search.split("&");
    var mode = query.length == 2 ? query[1].split("=")[1] : null;
    var url;
    
    $('.ui.modal').modal({closable: false});
    $("#main").hide();
    
    function generateToken(){
        $.get("https://opentdb.com/api_token.php?command=request", function(data){
            if (data.response_code == 0){
                if(mode != null){
                    url = `https://opentdb.com/api.php?amount=1&difficulty=${mode}&type=multiple&token=${data.token}`;
                } else {
                    url = `https://opentdb.com/api.php?amount=1&type=multiple&token=${data.token}`;
                }
                getQuestion();
            } else {
                console.log(data);
            }
        })
    }

    function getQuestion(){
        $("#main").hide();
        $.get(url, function(data){
            if(data.response_code == 0){
                question = data.results[0];
                setTrivia();
            }else{
                console.log(data);
            }
        })
    }
    
    function decode(str) {
        return str.replace(/&#(\d+);/g, function(match, dec) {
            return String.fromCharCode(dec);
        });
    }

    function setTrivia(){
        $("#question").html(question.question);
        $("#category").html("Category: " + question.category);
        let answers = question.incorrect_answers;
        answers.push(question.correct_answer);
        let buttons = [$("#answer1"), $("#answer2"), $("#answer3"), $("#answer4")];
        for(var i = 0; i < 4; i++){
            var brand = Math.floor(Math.random()*buttons.length);
            var arand = Math.floor(Math.random()*buttons.length); 
            buttons[brand].html(answers[arand]);
            buttons.splice(brand, 1);
            answers.splice(arand, 1);    
        }
        $(".loading").hide();
        $(".correct").hide();
        $("#main").show();
    }

    $(".answer").on('click', function(e){
        if($(this).html() == decode(question.correct_answer)){
            $(".correct").show();
            getQuestion();
            right++;
        } else{
            if(right > best){
                best = right;
            }
            right = 0;
            $('.ui.modal').modal('show');
        }
    })

    $("#retry").on('click', function(e){
        getQuestion();
        $('.ui.modal').modal('hide');
    })
    
    function sendDataToBot(){
        MessengerExtensions.getContext('212485252825769', 
        function success(thread_context){
            var date = new Date();
            var dd = date.getDate();
            var mm = date.getMonth()+1;
            var yyyy = date.getFullYear();
            var today = dd + "-" + mm + "-" + yyyy
            var difficulty = mode == null ? "any" : mode;
            $.post(`https://api.chatfuel.com/bots/5a68b284e4b02eba797feb45/users/${thread_context.psid}/send?chatfuel_token=vnbqX6cpvXUXFcOKr5RHJ7psSpHDRzO1hXBY8dkvn50ZkZyWML3YdtoCnKH7FSjC&chatfuel_block_name=Quit&correct=${best}&date=${today}&difficulty=${difficulty}`, function(data){
                if(data.success){
                    MessengerExtensions.requestCloseBrowser(function success() {
                        console.log(data);
                      }, function error(err) {
                        console.log("Some error closing has ocurred");
                    });
                } else {
                    console.log("Some error posting to chatfuel has ocurred");
                }
            })
        },
        function error(err){
            console.log("Some error getting context has ocurred");
        }
        );
    }

    $("#give_up").on('click', function(e){
        sendDataToBot();
    })

    $(window).on('beforeunload', function(){
        sendDataToBot();
    })

    window.extAsyncInit = function() {
        $(".loading").show();
        generateToken();
    };
})