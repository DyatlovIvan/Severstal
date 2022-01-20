import "./styles/styles.css"
import data from "./assets/default.json"

const IsActiveOption = {
    true: "true",
    false: "false",
    all: "all"
};
const header = ['id', 'name', 'balanced', 'isActive', 'email']
const element = document.querySelector("#table");
const rows = rowsHandler(data);
const table = tableDataHandler(rows);
renderApp();

function tableDataHandler(rows) {
    const table = {
        childrenIndexes: [],
        filter: {
            isActive: IsActiveOption.all
        }
    };
    rows.forEach((row, i) => {
        const parentId = rows.findIndex((_row) => _row.id === row.parentId);
        if (parentId === -1) {
            table.childrenIndexes.push(i);
            return;
        }
        rows[parentId].childrenIndexes.push(i);
    });
    return table;
}

function rowsHandler(data) {
    const rows = data.map(m => ({...m, childrenIndexes: []}));
    rows.sort((a, b) => a.id - b.id);
    return rows;
}

const unmountApp = () => (element.innerHTML = '');

function renderApp() {
    renderFilter(element);
    renderTable(table, element, header);
}

function rerenderApp() {
    unmountApp();
    renderApp();
}

function renderFilter(parentNode) {
    const filterNode = document.createElement("div");
    filterNode.innerHTML = `
    <label class="isActiveLabel">
      <span>filter:</span>
      <select>
          <option value="${IsActiveOption.true}">true</option>
          <option value="${IsActiveOption.false}">false</option>
          <option value="${IsActiveOption.all}">all</option>
      </select>
    </label>
  `;

    const selectNode = filterNode.querySelector("select");
    selectNode.value = table.filter.isActive;
    selectNode.addEventListener("change", e => {
        table.filter.isActive = e.target.value;
        rerenderApp();
    });
    parentNode.appendChild(filterNode);
}

function renderTable(table, parentNode, header) {

    const tableNode = document.createElement("table");
    tableNode.classList.add("table");
    parentNode.appendChild(tableNode);

    let thead = tableNode.createTHead();
    let row = thead.insertRow();
    for (let key of header) {
        let th = document.createElement("div");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
        tableNode.appendChild(row);
        th.classList.add("headerTop");
        row.classList.add("headerBlock");
    }

    tableNode.addEventListener("click", e => {
        toggleExpandable(e);
        rerenderApp(e);
    });

    table.childrenIndexes.forEach(f => {
        renderRow(f, tableNode);
    });
}

function toggleExpandable(event) {
    const rowExpandable = event.target.closest(".row_expandable");
    if (!rowExpandable) {
        return;
    }
    const rowId = rowExpandable.dataset.id;
    const isExpanded = rows[rowId].isExpanded;
    rows[rowId].isExpanded = !isExpanded;
}

function renderRow(rowId, parentNode) {
    const row = rows[rowId];
    const rowNode = document.createElement("div");
    const currentRowNode = document.createElement("div");
    const childrenRowsContainerNode = document.createElement("div");

    rowNode.appendChild(currentRowNode);
    rowNode.appendChild(childrenRowsContainerNode);
    parentNode.appendChild(rowNode);
    currentRowNode.classList.add("row");
    currentRowNode.dataset.id = rowId;

    switch (table.filter.isActive) {
        case IsActiveOption.true: {
            row.isActive && renderRowCells(row, currentRowNode);
            break;
        }
        case IsActiveOption.false: {
            !row.isActive && renderRowCells(row, currentRowNode);
            break;
        }
        case IsActiveOption.any:
        default:
            renderRowCells(row, currentRowNode);
    }

    if (row.childrenIndexes.length > 0) {
        currentRowNode.classList.add("row_expandable");

        const isExpanded = row.isExpanded;
        if (isExpanded) {
            currentRowNode.classList.add("row_expanded");
            row.childrenIndexes.forEach(f => {
                renderRow(f, childrenRowsContainerNode);
            });
        } else {
            currentRowNode.classList.remove("row_expanded");
        }
    }
}

function renderRowCells(row, rowNode){
    renderCell(row.id, rowNode);
    renderCell(row.name, rowNode);
    renderCell(row.balance, rowNode);
    renderCell(row.isActive, rowNode);
    renderCell(row.email, rowNode);
}

function renderCell(content, rowNode) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.innerHTML = content;
    rowNode.appendChild(cell);
}
