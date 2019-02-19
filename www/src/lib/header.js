var dt = require("./date");

exports.header = function () {
  var html = ""
    + "<div align=center style='background-color:yellow'>"
    + "<div style='color:black; display:inline-block; background-color:yellow; margin-top:15px; font-size:20px;'>Welcome World O^O</div>"
    + "<div align=right style='background-color:light'>"
    + "<div style='color:red; display:inline-block; background-color:yellow; margin-bottom:15px; margin-right:10px; font-size:18px;'>"
    +     dt.myDateTime()
    + "</div>"
    + "</div>";

  return html;
}
