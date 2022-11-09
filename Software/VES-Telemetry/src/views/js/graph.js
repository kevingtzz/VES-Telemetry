const { ipcRenderer } = require('electron');
const Chart = require('chart.js');

const header = document.getElementById('header_title');
const select = document.getElementById('variable-select');
const line_btn = document.getElementById('line_btn');
const area_btn = document.getElementById('area_btn');
const start_btn = document.getElementById('start_btn');
const graph_selection_wrapper = document.getElementById('graph_selection');
const chart_wrapper = document.getElementById('chart_wrapper');
const ctx = document.getElementById('myChart').getContext('2d');

var var_selected = 'none';
var graph_type_selected = 'line';
let variables = [];
var chart;
var graph_data = [];
var labels = [];


var speed_gradient = ctx.createLinearGradient(10,10,10,350);
speed_gradient.addColorStop(0,'rgba(247, 255, 0, 0.5)');
speed_gradient.addColorStop(1,'rgba(247, 255, 0, 0.0)');

var soc_gradient = ctx.createLinearGradient(10,10,10,350);
soc_gradient.addColorStop(0,'rgba(0, 255, 162, 0.5)');
soc_gradient.addColorStop(1,'rgba(0, 255, 162, 0.0)');

var minVolt_gradient = ctx.createLinearGradient(10,10,10,350);
minVolt_gradient.addColorStop(0,'rgba(247, 255, 0, 0.5)');
minVolt_gradient.addColorStop(1,'rgba(247, 255, 0, 0.0)');

var maxVolt_gradient = ctx.createLinearGradient(10,10,10,350);
maxVolt_gradient.addColorStop(0,'rgba(247, 255, 0, 0.5)');
maxVolt_gradient.addColorStop(1,'rgba(247, 255, 0, 0.0)');

var current_gradient= ctx.createLinearGradient(10,10,10,350);
current_gradient.addColorStop(0,'rgba(255, 127, 0, 0.5)');
current_gradient.addColorStop(1,'rgba(255, 127, 0, 0.0)');

var instantVolt_gradient= ctx.createLinearGradient(10,10,10,350);
instantVolt_gradient.addColorStop(0,'rgba(255, 127, 0, 0.5)');
instantVolt_gradient.addColorStop(1,'rgba(255, 127, 0, 0.0)');

var maxTemp_gradient= ctx.createLinearGradient(10,10,10,350);
maxTemp_gradient.addColorStop(0,'rgba(255, 127, 0, 0.5)');
maxTemp_gradient.addColorStop(1,'rgba(255, 127, 0, 0.0)');

var minTemp_gradient= ctx.createLinearGradient(10,10,10,350);
minTemp_gradient.addColorStop(0,'rgba(255, 127, 0, 0.5)');
minTemp_gradient.addColorStop(1,'rgba(255, 127, 0, 0.0)');


const var_color_code = {
    'speed': ['rgba(232, 239, 20, 1)', speed_gradient],
    'soc': ["rgba(0, 255, 140, 1)", soc_gradient], //BorderColor, background
    'minVolt': ['rgba(232, 239, 20, 1)', minVolt_gradient],
    'maxVolt': ['rgba(232, 239, 20, 1)', maxVolt_gradient],
    'current': ['rgba(255, 127, 20, 1)', current_gradient],
    'instantVolt': ['rgba(255, 0, 0, 1)', instantVolt_gradient],
    'maxTemp': ['rgba(255, 0, 0, 1)', maxTemp_gradient],
    'minTemp': ['rgba(255, 0, 0, 1)', minTemp_gradient],
}

chart = new Chart(ctx, {
    type: graph_type_selected,

    // The data for our dataset
    data: {
        labels: labels,
        datasets: [{
            label: var_selected,
            data: graph_data,
            // borderColor: var_color_code[var_selected][0],
            // pointHoverBackgroundColor: "rgba(246, 25, 25, .5)",
            // pointHoverBorderColor: "rgba(246, 25, 25, 1)",
            // backgroundColor: var_color_code[var_selected][1],
            pointRadius: 3,
        }]
    },
});

ipcRenderer.send('get variables');

ipcRenderer.on('variables', (event, vars) => {
    variables = vars;
    variables.forEach(element => {
        let variable = document.createElement('option');
        variable.value = element;
        let variable_name = document.createTextNode(element);

        variable.appendChild(variable_name);
        select.appendChild(variable);
    });
});

line_btn.addEventListener('click', () => {
    graph_type_selected = 'line';
    line_btn.style.color = 'rgb(129, 42, 170)';
    area_btn.style.color = 'gray';
    chart.data.datasets[0].fill = false;
});

area_btn.addEventListener('click', () => {
    graph_type_selected = 'area';
    area_btn.style.color = 'rgb(129, 42, 170)';
    line_btn.style.color = 'gray';
    chart.data.datasets[0].fill = true;
});

function selectVariable(variable) {
    var_selected = variable.value;
    chart.data.datasets[0].label = var_selected;
    chart.data.datasets[0].borderColor = var_color_code[var_selected][0],
    set_start_btn();
}

function set_start_btn() {
    if (var_selected && graph_type_selected) {
        start_btn.classList.remove('btn-secondary', 'disabled');
        start_btn.classList.add('btn-primary');

        start_btn.addEventListener('click', () => {
            ipcRenderer.send('get database data', var_selected);

            ipcRenderer.on('database data', (event, data) => {
                if (graph_data.length === 0) {
                    labels = data.map(element => `${element[0].getHours()}:${element[0].getMinutes()}:${element[0].getSeconds()}`);
                    graph_data = data.map(element => element[1]);

                    console.log(labels);

                    chart.data.datasets.data = graph_data;
                    chart.data.labels = labels;
                    chart.data.datasets[0].data = graph_data;
                }
            });

            graph_selection_wrapper.style.display = 'none';
            chart_wrapper.style.display = 'block';
            header.innerHTML = var_selected;
            header.style.fontSize = '20px';

            ipcRenderer.on('serial data', (event, data) => {
                addData(chart, `${data.timestamp.getHours()}:${data.timestamp.getMinutes()}:${data.timestamp.getSeconds()}`, data[var_selected]);
                header.innerHTML = data[var_selected];
            });

            function addData(chart, label, data) {
                chart.data.labels.push(label);
                chart.data.datasets[0].data.push(data);
                chart.update();
            }

        });
    }
}