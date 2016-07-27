Array.prototype.equals = function (array) {
  //if the other array is a falsy value, return
  if(!array) {
    return false;
  }

  //compare lengths - can save a lot of time
  if(this.length != array.length) {
    return false;
  }

  for(var i = 0, l=this.length; i < l; i++) {
    //Check if we have nested arrays
    if(this[i] instanceof Array && array[i] instanceof Array) {
      //recurse into the nested arrays
      if(!this[i].equals(array[i])) {
        return false;
      }
    }else if(this[i] != array[i]) {
      //Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }
  return true;
};

Array.prototype.unique = function () {
  let uniqueArray = [];
  this.forEach((el) => {
    if(!uniqueArray.includes(el)) {
      uniqueArray.push(el);
    }
  });
  return uniqueArray;
};

String.prototype.rpad = function(padString, length) {
	 var str = this;
    while (str.length < length)
        str = str + padString;
    return str;
}