<script type="application/javascript">

function validate() {
{{!-- var data = new FormData(); --}}
const data = new URLSearchParams();
data.append('name', document.getElementById("name").value);
data.append("password", document.getElementById("password").value);
var params = { name: document.getElementById("name").value, password: document.getElementById("password").value };
var request = new XMLHttpRequest();
request.open("POST", "/api/login");
request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
request.onload = function () {
var result = JSON.parse(request.response);
if (result.status === "y") {
window.location.href = "/index";
} else {
alert(result.meg);
}
};
{{!-- request.send(JSON.stringify(params)); --}}
request.send(data.toString());
}
