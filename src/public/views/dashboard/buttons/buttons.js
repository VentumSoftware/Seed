const createBtn = (data) => {
    console.log(`createBtn: ${data}`);
    try {

        var btn = document.createElement("button");
        btn.type = "submit";
        btn.style.position = "relative";
        btn.style.width = '100%';
        btn.style.overflowWrap = "normal";
        btn.data = "submit";
        var icon = document.createElement("i");

        if (data.display == "none")
            btn.style.display = "none";

        if (data.showLabel) {
            btn.innerHTML = data.label;
        }


        switch (data.type) {
            case "filter":
                btn.className = "btn btn-secondary";
                icon.className = "fa fa-search";
                break;
            case "erase":
                btn.className = "btn btn-danger";
                icon.className = "fa fa-trash";
                break;
            case "edit":
                btn.className = "btn btn-primary";
                icon.className = "fa fa-pencil";
                break;
            case "add":
                btn.className = "btn btn-success";
                icon.className = "fa fa-plus";
                break;
            case "cancel":
                btn.className = "btn btn-secondary";
                icon.className = "fa fa-ban";
                break;
            case "accept":
                btn.className = "btn btn-success";
                icon.className = "fa fa-check";
                break;
            default:
                btn.className = "btn btn-secondary";
                icon.className = "fa fa-search";
                break;
        }

        btn.appendChild(icon);

        return btn;
    } catch (error) {
        console.log(error);
    }

}

export default { createBtn };