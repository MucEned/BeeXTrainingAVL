// import jquery from "./jquery";
let socket = io("http://localhost:9090");
let isHost = false;
let myId;
let myRole;
let gameData;
let voteTeamResult = [];
let voteMissionResult = [];
let chosenTeam = [];
let pname = $("#playerName")[0].innerText;
let proom = $("#playerRoom")[0].innerText;
let nOTeammate;
let gameMissionResult = [];
let winLose = [];
let deathVote = "";
let isGameStarted = 0;
let enableRoleDes = false;
//======================server to client=====================================================================
socket.on('server-gui-cap-nhat-khung-nhin', function (membersArray) {
    if (isGameStarted == 0) {
        $('#playerList').html("");
        membersArray.forEach(function (member) {
            $('#playerList').append('<li class="player">' + member + '</li>')
        })
    }
    else if (isGameStarted == 1) {
        isGameStarted = 2;
        $("#gameWrapper").html("")
        $("#gameNotification").hide(200)
        $("#gameNotification").html("<h1>Đã có người chơi thoát, không thể tiếp tục game được nữa</h1>")
        $("#gameNotification").show(200)
        $("#endgame_form").show(200)
    }
})
socket.on('server-yeu-cau-hien-thi-nut-play', function () {
    if (isHost)
        $('#start_game').show(100);
})
socket.on('server-yeu-cau-dung-hien-thi-nut-play', function () {
    if (isHost)
        $('#start_game').hide(100);
})
socket.on('server-xac-nhan-id', function (pid) {
    myId = pid;
})
socket.on('server-xac-nhan-host', function () {
    isHost = true;
})
socket.on('server-gui-role', function (data) {
    isGameStarted = 1;
    if (data.player == myId) {
        myRole = data.role;
        $("#play_ground").show(100);
        $("#player_role")[0].innerText = myRole;
    }
})
socket.on('server-yeu-cau-cap-nhat-player-list', function (membersWithRole) {
    gameData = [...membersWithRole]
    $('#playerList').html("");
    membersWithRole.forEach(function (member) {
        if (myRole == "Mực nô đùa") {//normal player sight
            $('#playerList').append('<li class="player">' + member.name + '</li>')
        }
        else {//redteam or merlin sight
            if (member.role == "Mực gian tà" || member.role == "Mực the assassin")
                $('#playerList').append('<li class="player" style="color: red">' + member.name + '</li>')
            else $('#playerList').append('<li class="player">' + member.name + '</li>')
        }
    })
})
socket.on('server-gui-yeu-cau-teamup', function (data) {
    $('#teamup_msg').html('Hãy lập team thực hiện nhiệm vụ với <span style="font-weight: bold; font-size: 20px">' + data[1] + '</span> người(check vào số người chơi tương ứng)')
    nOTeammate = data[1]; //handle checkbox
    if (myId == data[0]) {
        $('#playerList').html("");
        gameData.forEach(function (member) {
            if (myRole == "Mực nô đùa") {//normal player sight
                $('#playerList').append('<li class="player">' + member.name + '<input class="cbox" type="checkbox" value="' + member.name + '"></li>')
            }
            else {//redteam or merlin sight
                if (member.role == "Mực gian tà" || member.role == "Mực the assassin")
                    $('#playerList').append('<li class="player" style="color: red">' + member.name + '<input class="cbox" type="checkbox" value="' + member.name + '"></li>')
                else $('#playerList').append('<li class="player">' + member.name + '<input class="cbox" type="checkbox" value="' + member.name + '"></li>')
            }
        })
        $('#teamleader').show(100);
    }
    //xu li so nguoi trong team dung theo rule
})
socket.on('server-gui-thong-tin-teamup', function (data) {
    $('#message').hide(100);
    $('#message').html("Team được đề xuất bởi: " + data.leader);
    $('#message').show(100);
    voteMissionResult = [];
    chosenTeam = [];
    chosenTeam = [...data.teamdata];
    console.log(data)
    console.log(data.teamdata)

    $('#system').show(100);

    $('#teammate').hide(100);
    $('#teammate').html("");
    chosenTeam.forEach(function (member) {
        $('#teammate').append('<li>' + member + '</li>')
    })
    $('#teammate').show(100);

    $('#playerList').html("");
    gameData.forEach(function (member) {
        if (myRole == "Mực nô đùa") {//normal player sight
            $('#playerList').append('<li class="player">' + member.name + '</li>')
        }
        else {//redteam or merlin sight
            if (member.role == "Mực gian tà" || member.role == "Mực the assassin")
                $('#playerList').append('<li class="player" style="color: red">' + member.name + '</li>')
            else $('#playerList').append('<li class="player">' + member.name + '</li>')
        }
    })
    voteTeamResult = [];
});

socket.on('server-vote-team-fb-cho-host', function (data) { //{vote, pid, pname, prole, leaderid}
    if (isHost) {
        voteTeamResult.push({ vote: data[0], pid: data[1], pname: data[2], prole: data[3] });

        if (voteTeamResult.length == gameData.length) {
            let voteCount = 0;
            let vr;
            voteTeamResult.forEach(function (data) {
                if (data.vote) voteCount++;
            })
            if (voteCount > voteTeamResult.length / 2) {
                vr = true;
                // socket.emit('host-gui-yeu-cau-vote-thanh-cong', gameData)
            } else {
                vr = false;
                // socket.emit('host-gui-yeu-cau-vote-lai', gameData)
            }
            socket.emit('host-gui-ket-qua-vote', [voteTeamResult, vr, chosenTeam, gameData])
        }
    }
})
socket.on('server-vote-team-fb', function (data) { //{vote, pid, pname, prole}
    $('#playerList').html("");
    data[0].forEach(function (member) {
        let vr;
        if (member.vote) {
            vr = '<span style="color: green">YES</span>'
        }
        else {
            vr = '<span style="color: purple">NO</span>'
        }
        if (myRole == "Mực nô đùa") {//normal player sight
            $('#playerList').append('<li class="player">' + member.pname + vr + '</li>')
        }
        else {//redteam or merlin sight
            if (member.prole == "Mực gian tà" || member.prole == "Mực the assassin")
                $('#playerList').append('<li class="player" style="color: red">' + member.pname + vr + '</li>')
            else $('#playerList').append('<li class="player">' + member.pname + vr + '</li>')
        }
    })

    $('#message').html("");
    if (data[1])
        $('#message').append('<h3>Team đã thành lập</h3>')
    else $('#message').append('<h3>Phần lớn mọi người không đồng ý team này được thành lập</h3>')
})
socket.on('server-give-misson-screen', function (data) {
    $('#death_vote').html("")
    deathVote = ""
    $('#message').html("");
    let isIInChosenTeam = false;
    chosenTeam.forEach((member) => {
        if (pname.trim() == member.trim()) isIInChosenTeam = true;
    })
    if (isIInChosenTeam) {
        $('#mission').show(100);
        if (myRole == "Mực gian tà" || myRole == "Mực the assassin")
            $('#MNo').show(100);
    }
    else $('#message').append('<h3>Đợi các người chơi khác thực hiện nhiệm vụ nhé~</h3>')
});
socket.on('server-send-vote-result-to-host', function (voteR) {
    if (isHost) {
        voteMissionResult.push(voteR);
        if (voteMissionResult.length == chosenTeam.length) {
            let result = true;
            voteMissionResult.forEach((vote) => {
                if (!vote)
                    result = false;
            })
            setTimeout(() => { socket.emit('client-send-final-vote-result-to-host', result) }, 3000)
        }
    }
});
socket.on('server-send-mission-final-result', function (result) {
    $('#message').html("");
    winLose.push(result);
    if (result) {
        gameMissionResult.push('<p style="color: green; display: inline;">---Success</p>')
        $('#message').append('<h3 style="color: green">Nhiệm vụ đã thành công!</h3>')
    }
    else {
        gameMissionResult.push('<p style="color: red; display: inline;">---Fail</p>')
        $('#message').append('<h3 style="color: red">Nhiệm vụ đã thất bại, có nội gián!!!</h3>')
    }
    $('#missionHistory').html("");
    gameMissionResult.forEach((mR) => {
        $('#missionHistory').append(mR)
    })
    if (winLose.length == 5) {
        let wincount = 0
        winLose.forEach((round) => {
            if (round) wincount++
            else wincount--
        })
        if (wincount > 0) {
            if (myRole != "Mực the assassin") {
                $("#gameNotification").show(200)
                $("#gameNotification").html("Every thing seem right...")
                //render mang hinh cua assassin
                $("#gameWrapper").html("")
            }
            else {
                $("#gameNotification").show(200)
                $("#gameWrapper").html("")
            }
        }
        else {
            $("#gameNotification").show(200)
            $("#gameNotification").html("Evil win")
            //nut replay
            $("#gameWrapper").html("")
        }
        if (isHost)
            socket.emit('client-send-game-is-ending', wincount)
    }

});
socket.on('server-send-mission-final-result', function () {
    if (isHost) {
        socket.emit('client-send-fb-update-mission-info-to-players', gameData)
    }
})
socket.on('server-give-assassin-last-chance', function () {
    if (myRole.trim() == "Mực the assassin") {
        $('#gameNotification').html('');
        $('#gameNotification').append('<i>Chọn tiên tri bên đối thủ để ám sát!</i>')
        gameData.forEach(function (member) {
            if (member.role.trim() != "Mực gian tà" && member.role.trim() != "Mực the assassin") {
                $('#gameNotification').append('<li class="player">' + member.name + '<input class="scbox" type="checkbox" value="' + member.role + '"></li>')
                // $('#gameNotification').append('<li class="player">' + member.name + '<input class="scbox" type="checkbox" value="' + member.role + '></li>')
            }
        })
        $("#seeker_find_btn").show(100)
    }
})
socket.on('server-decided-evil-win', function () {
    $("#gameWrapper").html("")
    $("#gameNotification").hide(200)
    $("#gameNotification").html("<h1>Evil win</h1>")
    $("#gameNotification").show(200)
    $("#endgame_form").show(200)

    gameData.forEach(function (member) {
        $('#endgame_form').append('<li>' + member.name + ' có role: ' + member.role + '</li>')
    })
});
socket.on('server-decided-human-win', function () {
    $("#gameWrapper").html("")
    $("#gameNotification").hide(200)
    $("#gameNotification").html("<h1>Human win</h1>")
    $("#gameNotification").show(200)
    $("#endgame_form").show(200)

    gameData.forEach(function (member) {
        $('#endgame_form').append('<li>' + member.name + ' có role: ' + member.role + '</li>')
    })
});
socket.on('server-send-death-vote-to-host', function () {
    deathVote += "X"
    if (isHost) {
        if (deathVote.length == 5) {
            socket.emit('client-has-vote-5-times-fail')
        }
    }
    $('#death_vote').html("")
    $('#death_vote').append(deathVote)
})
socket.on('server-send-host-is-disconnect', function () {
    if (isGameStarted < 2) {
        $("#gameWrapper").html("")
        $("#gameNotification").hide(200)
        $("#gameNotification").html("<h1>Host đã mất kết nối</h1>")
        $("#gameNotification").show(200)
        $("#endgame_form").show(200)
    }
});
socket.on('server-send-role-des-for-player', function (data) {//[des, data[1]]
    console.log(data[1])
    if (myId == data[1]) {
        enableRoleDes = true;
        $("#role_des").html("")
        $("#role_des").append("<p>" + data[0] + "</p>")
        $("#role_des").show(200)
    }
});
//=======Client to server=======================================================================================
$(document).ready(() => {
    socket.emit('client-gui-thong-tin-khoi-tao', {
        name: pname,
        room: proom
    })
})
$("#start_game").click(() => {
    $('#start_game').hide(100);
    socket.emit('client-start-game')
})
$("#go").click(() => {
    let teammate = [];
    let plist = document.getElementsByClassName('cbox')
    for (let i = 0; i < plist.length; i++) {
        if (plist[i].checked) {
            teammate.push(plist[i].value.trim())
        }
    }
    if (teammate.length == nOTeammate) {
        $('#teamleader').hide(100);
        socket.emit('client-teamup-fb', [teammate, pname])
    }
    else
        alert("Please select the same number of team members as required")
})
$("#TYes").click(() => {
    $('#system').hide(100)
    socket.emit('client-vote-team-fb', [true, myId, pname, myRole])
})
$(("#TNo")).click(() => {
    $('#system').hide(100)
    socket.emit('client-vote-team-fb', [false, myId, pname, myRole])
})

$("#MYes").click(() => {
    $('#mission').hide(100)
    socket.emit('client-vote-mission-fb', true)
})
$("#MNo").click(() => {
    $('#mission').hide(100)
    socket.emit('client-vote-mission-fb', false)
})
$("#seeker_find_btn").click(() => {
    $("#gameNotification").hide(100)
    $("#seeker_find_btn").hide(100)
    let seeker
    let plist = document.getElementsByClassName('scbox')
    for (let i = 0; i < plist.length; i++) {
        if (plist[i].checked) {
            seeker = plist[i].value.trim()
        }
    }
    if (seeker == "Mực tiên tri") {
        //handle
        socket.emit('assassin-kill-seeker')
    }
    else {
        //handle
        socket.emit('assassin-not-kill-seeker')
    }
})
$("#player_role").click(() => {
    if (!enableRoleDes) {
        console.log("enable")
        socket.emit('client-get-my-role-des', [myRole, myId])
    }
    else {
        console.log("disable")
        enableRoleDes = false;
        $("#role_des").hide(100);
    }
})