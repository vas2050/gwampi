var dt = require("./date");

exports.html = function (user) {
  var html = ""
    + "<div align=center style='background-color: yellow'>"
    + "  <div style='display:inline-block; background-color:yellow; margin-top:15px; color:black; font-size:20px;'>Welcome World O^O</div>"
    + "  <div align=right style='margin-right:10px;'>"
    + "    <div style='background-color:yellow; color:red; font-size:14px;'>" + dt.myDateTime() + "</div><br/>";

  if (!user) {
    html = html
      + "    <div style='display:inline-block; background-color:yellow; color:blue; font-size:18px;'><a href='/login'>Login</a></div>"
      + "    <div style='display:inline-block; margin-left: 5px; margin-right: 5px; border-left: solid silver 2px; border-right: solid silver 2px; height:15px;'></div>"
      + "    <div style='display:inline-block; background-color:yellow; color:blue; font-size:18px; margin-bottom: 5px;'><a href='/signup'>Sign Up</a></div>";
  }
  else {
    html = html
      + "    <div style='display:inline-block; background-color:yellow; color:blue; font-size:18px;'>" + user.fullname + "</div>";
      + "    <div style='display:inline-block; margin-left: 5px; margin-right: 5px; border-left: solid silver 2px; border-right: solid silver 2px; height:15px;'></div>"
      + "    <div style='display:inline-block; background-color:yellow; color:blue; font-size:18px; margin-bottom: 5px;'><a href='/logout'>Logout</a></div>";
  }

  html = html
    + "  </div>"
    + "</div>";

  return html;
}
