var dt = function () {
  return new Date;
}

module.exports = {
  myDTString: function(){ return dt(); },
  myDate    : function(){ return dt().toDateString(); },
  myTime    : function(){ return dt().toLocaleTimeString(); },
  myDateTime: function(){ return this.myDate() + ' ' + this.myTime(); }
}
