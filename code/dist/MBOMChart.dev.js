"use strict";

var apiKey = {
  value: "2b56f658-b11f-4067-9537-631bf27a30f0"
}; // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

var chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  ygreen: 'rgb(78, 168, 50)',
  pink: 'rgb(230, 124, 217)',
  dblue: 'rgb(31, 68, 163)',
  dred: 'rgb(156, 0, 0)',
  grey: 'rgb(201, 203, 207)'
}; //Distribute-----------------------------------------------------------------------------------------------------------------------

var sliderD;

function sliderStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Distribute_ExtendSlide&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      sliderD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getSlider() {
  sliderStatus();

  if (sliderD != null) {
    if (sliderD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var seperatorD;

function seperatorStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Distribute_ExtendSeperator&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      seperatorD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getSeperator() {
  seperatorStatus();

  if (seperatorD != null) {
    if (seperatorD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var conveyerD;

function conveyerStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Distribute_ConveyerForward&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      conveyerD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getConveyer() {
  conveyerStatus();

  if (conveyerD != null) {
    if (conveyerD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var color = Chart.helpers.color;
var dConfig = {
  type: 'line',
  data: {
    datasets: [{
      label: 'Slider',
      fontSize: 16,
      backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
      borderColor: chartColors.red,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Seperator',
      fontSize: 16,
      backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
      borderColor: chartColors.blue,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Conveyer',
      backgroundColor: color(chartColors.yellow).alpha(0.5).rgbString(),
      borderColor: chartColors.yellow,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }]
  },
  options: {
    title: {
      display: true,
      fontSize: 20,
      text: 'Distribute station'
    },
    scales: {
      xAxes: [{
        type: 'realtime',
        realtime: {
          duration: 20000,
          refresh: 5000,
          delay: 5000,
          onRefresh: function onRefresh(chart) {
            var now = Date.now();
            chart.data.datasets[0].data.push({
              x: now,
              y: getSlider()
            });
            chart.data.datasets[1].data.push({
              x: now,
              y: getSeperator()
            });
            chart.data.datasets[2].data.push({
              x: now,
              y: getConveyer()
            });
          }
        }
      }],
      yAxes: [{
        ticks: {
          min: -0.3,
          max: 1.3,
          fontSize: 16,
          fontStyle: 'bold',
          callback: function callback(value) {
            if (value == 0) {
              return 'off';
            } else {
              return value == 1 ? 'on' : '';
            }
          }
        },
        gridLines: {
          display: false
        }
      }]
    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }
  }
}; //Join-----------------------------------------------------------------------------------------------------------------------

var retractrD;

function retractGStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Join_RetractGate&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      retractrD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getRetractG() {
  retractGStatus();

  if (retractrD != null) {
    if (retractrD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var seperatorJD;

function seperatorJStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Join_ExtendSeperator&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      seperatorJD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getSeperatorJ() {
  seperatorJStatus();

  if (seperatorJD != null) {
    if (seperatorJD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var conveyerJD;

function conveyerJStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Join_ConvForwardG2&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      conveyerJD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getConveyerJ() {
  conveyerJStatus();

  if (conveyerJD != null) {
    if (conveyerJD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var eSlideD;

function eSlideStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Join_ExtendSlide&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      eSlideD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getESlide() {
  eSlideStatus();

  if (eSlideD != null) {
    if (eSlideD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var rSlideD;

function rSlideStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Join_RetractSlide&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      rSlideD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getRSlide() {
  rSlideStatus();

  if (rSlideD != null) {
    if (rSlideD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var vacuumD;

function vacuumStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Join_VacuumOn&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      vacuumD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getVacuum() {
  vacuumStatus();

  if (vacuumD != null) {
    if (vacuumD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var cupD;

function cupStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Join_SuctionCupDownwards&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      cupD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getCup() {
  cupStatus();

  if (cupD != null) {
    if (cupD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var jConfig = {
  type: 'line',
  data: {
    datasets: [{
      label: 'Retract gate',
      fontSize: 16,
      backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
      borderColor: chartColors.red,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Seperator',
      fontSize: 16,
      backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
      borderColor: chartColors.blue,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Conveyer',
      backgroundColor: color(chartColors.yellow).alpha(0.5).rgbString(),
      borderColor: chartColors.yellow,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Extend slide',
      backgroundColor: color(chartColors.purple).alpha(0.5).rgbString(),
      borderColor: chartColors.purple,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Retract slide',
      backgroundColor: color(chartColors.green).alpha(0.5).rgbString(),
      borderColor: chartColors.green,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Vacuum',
      backgroundColor: color(chartColors.grey).alpha(0.5).rgbString(),
      borderColor: chartColors.grey,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Suction cup',
      backgroundColor: color(chartColors.orange).alpha(0.5).rgbString(),
      borderColor: chartColors.orange,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }]
  },
  options: {
    title: {
      display: true,
      fontSize: 20,
      text: 'Join station'
    },
    scales: {
      xAxes: [{
        type: 'realtime',
        realtime: {
          duration: 20000,
          refresh: 5000,
          delay: 5000,
          onRefresh: function onRefresh(chart) {
            var now = Date.now();
            chart.data.datasets[0].data.push({
              x: now,
              y: getRetractG()
            });
            chart.data.datasets[1].data.push({
              x: now,
              y: getSeperatorJ()
            });
            chart.data.datasets[2].data.push({
              x: now,
              y: getConveyerJ()
            });
            chart.data.datasets[3].data.push({
              x: now,
              y: getESlide()
            });
            chart.data.datasets[4].data.push({
              x: now,
              y: getRSlide()
            });
            chart.data.datasets[5].data.push({
              x: now,
              y: getVacuum()
            });
            chart.data.datasets[6].data.push({
              x: now,
              y: getCup()
            });
          }
        }
      }],
      yAxes: [{
        ticks: {
          min: -0.3,
          max: 1.3,
          fontSize: 16,
          fontStyle: 'bold',
          callback: function callback(value) {
            if (value == 0) {
              return 'off';
            } else {
              return value == 1 ? 'on' : '';
            }
          }
        },
        gridLines: {
          display: false
        }
      }]
    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }
  }
}; //Sort-----------------------------------------------------------------------------------------------------------------------

var conveyerSD;

function conveyerSStatus() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://digitaltwinservice.de/api/Database/GetValue?NodeName=PLC_Sort_ConvForwardG2&useHistoricalData=true');
  xhr.setRequestHeader('X-Api-Key', apiKey.value);

  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      conveyerSD = xhr.responseText.includes("True");
    }
  };

  xhr.send();
}

function getSConveyer() {
  conveyerSStatus();

  if (conveyerSD != null) {
    if (conveyerSD) {
      return 1;
    } else {
      return 0;
    }
  }
}

var sConfig = {
  type: 'line',
  data: {
    datasets: [{
      label: 'Conveyer status',
      backgroundColor: color(chartColors.yellow).alpha(0.5).rgbString(),
      borderColor: chartColors.yellow,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }]
  },
  options: {
    title: {
      display: true,
      fontSize: 20,
      text: 'Sort station'
    },
    scales: {
      xAxes: [{
        type: 'realtime',
        realtime: {
          duration: 20000,
          refresh: 5000,
          delay: 5000,
          onRefresh: function onRefresh(chart) {
            var now = Date.now();
            chart.data.datasets[0].data.push({
              x: now,
              y: getSConveyer()
            });
          }
        }
      }],
      yAxes: [{
        ticks: {
          min: -0.3,
          max: 1.3,
          fontSize: 16,
          fontStyle: 'bold',
          callback: function callback(value) {
            if (value == 0) {
              return 'off';
            } else {
              return value == 1 ? 'on' : '';
            }
          }
        },
        gridLines: {
          display: false
        }
      }]
    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }
  }
}; //All-----------------------------------------------------------------------------------------------------------------------

var aConfig = {
  type: 'line',
  data: {
    datasets: [{
      label: 'Slider',
      fontSize: 16,
      backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
      borderColor: chartColors.red,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Seperator',
      fontSize: 16,
      backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
      borderColor: chartColors.blue,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Conveyer',
      backgroundColor: color(chartColors.yellow).alpha(0.5).rgbString(),
      borderColor: chartColors.yellow,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Retract gate',
      fontSize: 16,
      backgroundColor: color(chartColors.ygreen).alpha(0.5).rgbString(),
      borderColor: chartColors.ygreen,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Seperator',
      fontSize: 16,
      backgroundColor: color(chartColors.pink).alpha(0.5).rgbString(),
      borderColor: chartColors.pink,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Conveyer',
      backgroundColor: color(chartColors.dblue).alpha(0.5).rgbString(),
      borderColor: chartColors.dblue,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Extend slide',
      backgroundColor: color(chartColors.purple).alpha(0.5).rgbString(),
      borderColor: chartColors.purple,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Retract slide',
      backgroundColor: color(chartColors.green).alpha(0.5).rgbString(),
      borderColor: chartColors.green,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Vacuum',
      backgroundColor: color(chartColors.grey).alpha(0.5).rgbString(),
      borderColor: chartColors.grey,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Suction cup',
      backgroundColor: color(chartColors.orange).alpha(0.5).rgbString(),
      borderColor: chartColors.orange,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }, {
      label: 'Conveyer status',
      backgroundColor: color(chartColors.dred).alpha(0.5).rgbString(),
      borderColor: chartColors.dred,
      fill: false,
      cubicInterpolationMode: 'monotone',
      data: []
    }]
  },
  options: {
    title: {
      display: true,
      fontSize: 20,
      text: 'All actuators'
    },
    scales: {
      xAxes: [{
        type: 'realtime',
        realtime: {
          duration: 20000,
          refresh: 5000,
          delay: 5000,
          onRefresh: function onRefresh(chart) {
            var now = Date.now();
            chart.data.datasets[0].data.push({
              x: now,
              y: getSlider()
            });
            chart.data.datasets[1].data.push({
              x: now,
              y: getSeperator()
            });
            chart.data.datasets[2].data.push({
              x: now,
              y: getConveyer()
            });
            chart.data.datasets[3].data.push({
              x: now,
              y: getRetractG()
            });
            chart.data.datasets[4].data.push({
              x: now,
              y: getSeperatorJ()
            });
            chart.data.datasets[5].data.push({
              x: now,
              y: getConveyerJ()
            });
            chart.data.datasets[6].data.push({
              x: now,
              y: getESlide()
            });
            chart.data.datasets[7].data.push({
              x: now,
              y: getRSlide()
            });
            chart.data.datasets[8].data.push({
              x: now,
              y: getVacuum()
            });
            chart.data.datasets[9].data.push({
              x: now,
              y: getCup()
            });
            chart.data.datasets[10].data.push({
              x: now,
              y: getSConveyer()
            });
          }
        }
      }],
      yAxes: [{
        ticks: {
          min: -0.3,
          max: 1.3,
          fontSize: 16,
          fontStyle: 'bold',
          callback: function callback(value) {
            if (value == 0) {
              return 'off';
            } else {
              return value == 1 ? 'on' : '';
            }
          }
        },
        gridLines: {
          display: false
        }
      }]
    },
    tooltips: {
      mode: 'nearest',
      intersect: false
    },
    hover: {
      mode: 'nearest',
      intersect: false
    }
  }
};

window.onload = function () {
  var ca = document.getElementById('allChart').getContext('2d');
  window.allChart = new Chart(ca, aConfig);
};