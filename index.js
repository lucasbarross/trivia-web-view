$(document).ready(function(){
    var question;
    var best = 0;
    var right = 0;

    $('.ui.modal').modal({closable: false});

    function getQuestion(){
        $.get("https://opentdb.com/api.php?amount=1&type=multiple", function(data){
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
    }

    $(".answer").on('click', function(e){
        if($(this).html() == decode(question.correct_answer)){
            getQuestion();
            right++;
        } else{
            $('.ui.modal').modal('show');
        }
    })

    $("#retry").on('click', function(e){
        getQuestion();
        
        if(right > best){
            best = right;
        }

        right = 0;
        
        $('.ui.modal').modal('hide');
    })
    
    function sendDataToBot(){
        MessengerExtensions.getContext('212485252825769', 
        function success(thread_context){
            $.post(`https://api.chatfuel.com/bots/212485252825769/users/${thread_context.psid}/send?chatfuel_token=vnbqX6cpvXUXFcOKr5RHJ7psSpHDRzO1hXBY8dkvn50ZkZyWML3YdtoCnKH7FSjC&chatfuel_block_name=Quit&correct=${best}`, function(data){
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
        getQuestion();
    };
})