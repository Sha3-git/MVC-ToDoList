var i = 0;
var userTasks = [];
var taskObj = [];
var list = document.getElementById("list1");


function buildTaskObject() {
    //list.innerHTML = "";
    $(list).empty();
    for (task of taskObj) {
        var form = document.createElement("div");
        form.className = "input-group mb-2";
        if (task.claimed === false && task.completed === false && task.abandoned === false) {
            form.innerHTML =
            `<div class="input-group mb-2" id="f` + task.identifier + `">
                <input type="text" disabled class="form-control" placeholder="`+ task.input + `"  aria-describedby="button-addon2">
                <button class="btn btn-outline-secondary" type="button" id="b1" onclick="claim('f` + task.identifier + `')">Claim</button> 
            </div>`;
        }
        else if (task.claimed === true) {
            form.innerHTML =
                `<div class="input-group mb-3">
                    <div class="input-group-text">
                    <input class="form-check-input mt-0" type="checkbox" value="" aria-label="Checkbox for following text input" onclick="complete('f` + task.identifier + `')">
                    </div>
                    <input type="text" disabled class="form-control" placeholder="`+ task.input + `" aria-label="Text input with checkbox">
                    <button class="btn btn-outline-secondary" type="button" id="button-addon2" onclick="abandon('f` + task.identifier + `')">Abandon</button>
                </div>`;
        }
        else if (task.abandoned === true)
        {
            form.innerHTML =
            `<div class="input-group mb-2" id="f` + task.identifier + `">
                <input type="text" disabled class="form-control" placeholder="`+ task.input + `"  aria-describedby="button-addon2">
                <button class="btn btn-outline-secondary" type="button" id="b1" onclick="claim('f` + task.identifier + `')">Claim</button> 
            </div>`;
        }
        else if (task.completed === true)
        {
            form.innerHTML =
                `<div class="input-group mb-3">
                    <div class="input-group-text">
                    <input class="form-check-input mt-0" checked type="checkbox" value="" aria-label="Checkbox for following text input" onclick="claim('f` + task.identifier + `')">
                    </div>
                    <input type="text" disabled class="form-control" id = "intext" placeholder="`+ task.input + `" aria-label="Text input with checkbox">
                    </div>`;
        }
        //list.append(form);    
        $(list).append(form);
    }
    console.log(form)
}

$(document).ready(() => {
    $("body").on("click", "#add", function(){
        var input = document.getElementById("userInput").value;
        if (input.trim().length != 0) {
            var identifier = i += 1
            var p = new taskObject(identifier, input);
            taskObj.push(p);
            userInput.value = "";
            $("#userInput").attr('value') == "";
        }
        buildTaskObject();
        console.log(taskObj);
    });
    $("#remove").click( ()=>{
        for (task of taskObj) {
            if (task.completed === true) {
                var index = taskObj.indexOf(task);
                if (index > -1) {
                    taskObj.splice(index, 1);
                }
            }
        }
        buildTaskObject();
    })
});

function claim(val) {
    for(task of taskObj)
    {
        if ("f" +task.identifier === val)
        {
            task.claimed = true;
            task.completed = false;
            task.abandoned = false;
        }
    }
    buildTaskObject();

}

function taskObject(identifier, input) {
    this.identifier = identifier;
    this.input = input;
    this.claimed = false;
    this.completed = false;
    this.abandoned = false;
}



function abandon(val) {
    for(task of taskObj)
    {
        if ("f" +task.identifier === val)
        {
            task.abandoned = true;
            task.claimed = false;
            task.completed = false;
        }
    }
    buildTaskObject();
}
function complete(val) {
    for(task of taskObj)
    {
        if ("f" +task.identifier === val)
        {
            task.abandoned = false;
            task.claimed = false;
            task.completed = true;
        }
    }
    buildTaskObject();
}
