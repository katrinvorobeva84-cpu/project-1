const staffMembers = [
  { id: "t1", name: "Алексеев Иван Петрович", position: "Доцент кафедры математики" },
  { id: "t2", name: "Волкова Мария Сергеевна", position: "Старший преподаватель кафедры информатики" },
  { id: "t3", name: "Громов Алексей Николаевич", position: "Преподаватель кафедры иностранных языков" },
  { id: "t4", name: "Дмитриева Ольга Викторовна", position: "Методист учебного отдела" }
];

const STORAGE_KEY = "qualificationRecords";

const state = {
  records: loadRecords(),
  filter: "all"
};

const elements = {
  filterSelect: document.getElementById("teacher-filter"),
  addButton: document.getElementById("add-record"),
  saveButton: document.getElementById("save-records"),
  feedback: document.getElementById("save-feedback"),
  tableBody: document.getElementById("records-body"),
  rowTemplate: document.getElementById("record-row-template")
};

document.addEventListener("DOMContentLoaded", () => {
  initialiseFilter();
  renderTable();

  elements.filterSelect.addEventListener("change", handleFilterChange);
  elements.addButton.addEventListener("click", handleAddRecord);
  elements.saveButton.addEventListener("click", handleSaveRecords);
});

function initialiseFilter() {
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Все преподаватели";
  elements.filterSelect.appendChild(allOption);

  staffMembers.forEach((staff) => {
    const option = document.createElement("option");
    option.value = staff.id;
    option.textContent = staff.name;
    elements.filterSelect.appendChild(option);
  });

  elements.filterSelect.value = state.filter;
}

function handleFilterChange(event) {
  state.filter = event.target.value;
  renderTable();
}

function handleAddRecord() {
  const teacherId = state.filter === "all" ? staffMembers[0]?.id ?? "" : state.filter;

  const staffMember = staffMembers.find((member) => member.id === teacherId);

  const newRecord = {
    id: createRecordId(),
    teacherId,
    position: staffMember?.position ?? "",
    place: "",
    startDate: "",
    endDate: "",
    format: "",
    topic: "",
    order: "",
    certificate: ""
  };

  state.records.push(newRecord);
  renderTable();

  if (teacherId && state.filter === "all") {
    // highlight newly added record even when filter set to "all"
    elements.filterSelect.value = "all";
  }
}

function handleSaveRecords() {
  saveRecords(state.records);
  showFeedback("Данные сохранены");
}

function handleDeleteRecord(recordId) {
  state.records = state.records.filter((record) => record.id !== recordId);
  renderTable();
}

function renderTable() {
  const filteredRecords = state.records.filter((record) =>
    state.filter === "all" ? true : record.teacherId === state.filter
  );

  elements.tableBody.innerHTML = "";

  filteredRecords.forEach((record, index) => {
    const row = elements.rowTemplate.content.firstElementChild.cloneNode(true);

    row.dataset.recordId = record.id;

    const indexCell = row.querySelector(".records-table__index");
    indexCell.textContent = index + 1;

    const teacherSelect = row.querySelector(".record__teacher");
    populateTeacherOptions(teacherSelect, record.teacherId);

    const positionInput = row.querySelector(".record__position");
    positionInput.value = record.position ?? "";

    const placeInput = row.querySelector(".record__place");
    placeInput.value = record.place ?? "";

    const dateStartInput = row.querySelector(".record__date-start");
    dateStartInput.value = record.startDate ?? "";

    const dateEndInput = row.querySelector(".record__date-end");
    dateEndInput.value = record.endDate ?? "";

    const formatInput = row.querySelector(".record__format");
    formatInput.value = record.format ?? "";

    const topicInput = row.querySelector(".record__topic");
    topicInput.value = record.topic ?? "";

    const orderInput = row.querySelector(".record__order");
    orderInput.value = record.order ?? "";

    const certificateInput = row.querySelector(".record__certificate");
    certificateInput.value = record.certificate ?? "";

    const deleteButton = row.querySelector(".record__delete");

    teacherSelect.addEventListener("change", () => {
      record.teacherId = teacherSelect.value;
      const staff = staffMembers.find((member) => member.id === record.teacherId);
      if (staff && (!record.position || record.position === positionInput.dataset.autoPosition)) {
        record.position = staff.position;
        positionInput.value = staff.position;
        positionInput.dataset.autoPosition = staff.position;
      }
      renderTable();
    });

    positionInput.dataset.autoPosition = staffMembers.find((member) => member.id === record.teacherId)?.position ?? "";

    positionInput.addEventListener("input", () => {
      record.position = positionInput.value;
    });

    placeInput.addEventListener("input", () => {
      record.place = placeInput.value;
    });

    dateStartInput.addEventListener("change", () => {
      record.startDate = dateStartInput.value;
    });

    dateEndInput.addEventListener("change", () => {
      record.endDate = dateEndInput.value;
    });

    formatInput.addEventListener("input", () => {
      record.format = formatInput.value;
    });

    topicInput.addEventListener("input", () => {
      record.topic = topicInput.value;
    });

    orderInput.addEventListener("input", () => {
      record.order = orderInput.value;
    });

    certificateInput.addEventListener("input", () => {
      record.certificate = certificateInput.value;
    });

    deleteButton.addEventListener("click", () => handleDeleteRecord(record.id));

    elements.tableBody.appendChild(row);
  });

  toggleTableEmptyState(filteredRecords.length === 0);
}

function toggleTableEmptyState(isEmpty) {
  if (isEmpty) {
    const emptyRow = document.createElement("tr");
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 10;
    emptyCell.className = "records-table__empty";
    emptyCell.textContent = "Записей пока нет. Добавьте первую запись.";
    emptyRow.appendChild(emptyCell);
    elements.tableBody.appendChild(emptyRow);
  }
}

function populateTeacherOptions(selectElement, selectedId) {
  selectElement.innerHTML = "";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Выберите преподавателя";
  selectElement.appendChild(emptyOption);

  staffMembers.forEach((staff) => {
    const option = document.createElement("option");
    option.value = staff.id;
    option.textContent = staff.name;
    selectElement.appendChild(option);
  });

  selectElement.value = selectedId ?? "";
}

function showFeedback(message) {
  elements.feedback.textContent = message;
  elements.feedback.classList.add("feedback--visible");
  setTimeout(() => {
    elements.feedback.classList.remove("feedback--visible");
    elements.feedback.textContent = "";
  }, 2500);
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error("Не удалось загрузить данные из localStorage", error);
    return [];
  }
}

function createRecordId() {
  return `rec-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
