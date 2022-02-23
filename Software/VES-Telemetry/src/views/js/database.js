const { ipcRenderer } = require('electron');
const Dialogs = require('dialogs');

const dialogs = Dialogs(opts = {
    icon: __dirname + '/assets/icons/VES_Telemetry_Icon.png'
});

const create_btn = document.getElementById('create_btn');
// const start_btn = document.getElementById('start_btn');
// const table_selected_indicator = document.getElementById('table_selected_indicator');
// const table_selected_text = document.getElementById('table_selected_text');
// const table_list = document.getElementById('table_list');
// const tbody = document.getElementById('tbody');

// let table_selected = null;
// let recording = false;

// // ipcRenderer.send('get tables');

create_btn.addEventListener('click', () => {
    dialogs.prompt('Event name', name => {
        if (name === '') {
            dialogs.alert('Event name is required!');
        } else {
            ipcRenderer.send('create event', name);
        }
    });
});

// start_btn.addEventListener('click', () => {
//     if (table_selected !== null) {
//         if (!recording) {
//             recording = true;
//             ipcRenderer.send('record', recording);
//             set_start_btn();
//         } else {
//             recording = false;
//             ipcRenderer.send('record', recording);
//             set_start_btn();
//         }
//     }  
// });

// ipcRenderer.on('data update', (event, data) => {
//     tables = data[0];
//     tables.forEach(table => {
//         create_list_node(table);
//     });
//     table_selected = data[1];
//     recording = data[2];

//     if (table_selected !== null) {
//         table_selected_text.innerHTML = `Table selected: ${table_selected}`;
//         table_selected_indicator.style.backgroundColor = 'rgb(86, 209, 82)';
//         start_btn.classList.remove('disabled');
//         set_start_btn();
//     }
// });

ipcRenderer.on('table created', (event, event_name) => {
    dialogs.alert(`${event_name} created successfully.`);
    create_list_node(event_name);
});

// ipcRenderer.on('table deleted', (event, name) => {
//     alert(`${name} deleted successfully.`);
//     tbody.removeChild(document.getElementById(name));
// });

// ipcRenderer.on('table selected', (event, name) => {
//     alert(`${name} table has been selected.`);
//     table_selected = name;
//     table_selected_text.innerHTML = `Table selected: ${name}`;
//     table_selected_indicator.style.backgroundColor = 'rgb(86, 209, 82)';
//     start_btn.classList.remove('disabled');
//     set_start_btn();
// });

ipcRenderer.on('row affected', (e, event) => {
    console.log(event);
});

// function set_start_btn() {
//     if (table_selected !== null) {
//         start_btn.classList.add('active');
//         start_btn.innerHTML = recording ? 'Stop storage' : 'Start storage'; 
//         start_btn.className = recording ? "btn btn-outline-danger" : "btn btn-outline-success";
//     } 
// }

function create_list_node(event_name) {
    let trow = document.createElement('tr');
    let event_field = document.createElement('td');
    let event_name_wrapper = document.createElement('div');
    let event_name_text = document.createTextNode(event_name);
    let event_action_wrapper = document.createElement('div');
    let select_button = document.createElement('button');
    let delete_button = document.createElement('button');
    let select_button_text = document.createTextNode('Select');
    let delete_button_text = document.createTextNode('Delete');

    trow.setAttribute('id', event_name);

    event_field.classList.add('event_field');
    event_name_wrapper.classList.add('event_name_wrapper');
    event_action_wrapper.classList.add('event_action_wrapper');
    select_button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    delete_button.classList.add('btn', 'btn-outline-danger', 'btn-sm');

    tbody.appendChild(trow);
    trow.appendChild(event_field);
    event_field.appendChild(event_name_wrapper);
    event_field.appendChild(event_action_wrapper);
    event_name_wrapper.appendChild(event_name_text);
    event_action_wrapper.appendChild(select_button);
    event_action_wrapper.appendChild(delete_button);
    select_button.appendChild(select_button_text);
    delete_button.appendChild(delete_button_text);

    select_button.addEventListener('click', () => {
        ipcRenderer.send('table selected', table);
    });

    // delete_button.addEventListener('click', () => {
    //     prompt({
    //         title: 'Delete Table',
    //         label: `Please enter the table name "${table}" to continue`,
    //         inputAttrs: {
    //             type: 'text',
    //             required: true
    //         },
    //         type: 'input',
    //         resizable: true
    //     })
    //     .then(input => {
    //         if (input !== null) {
    //             if (input === table) {
    //                 ipcRenderer.send('table deleted', input);
    //             } else {
    //                 alert("Name not match");
    //             }
    //         }
    //     })
    //     .catch(console.error);
    // });
}