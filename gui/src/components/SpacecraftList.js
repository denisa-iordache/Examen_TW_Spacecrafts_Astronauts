import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getSpacecrafts,
  addSpacecraft,
  saveSpacecraft,
  deleteSpacecraft,
  importSpacecrafts,
  exportSpacecrafts,
} from "../actions";

const spacecraftSelector = (state) => state.spacecraft.spacecraftList;
const spacecraftCountSelector = (state) => state.spacecraft.count;

function SpacecraftList() {
  const [isDialogShown, setIsDialogShown] = useState(false);
  const [nume, setNume] = useState("");
  const [viteza_maxima, setViteza_maxima] = useState(0);
  const [masa, setMasa] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(true);
  const [selectedSpacecraft, setSelectedSpacecraft] = useState(null);
  const [filterString, setFilterString] = useState("");
  const navigate = useNavigate();
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState(1);

  const [filters, setFilters] = useState({
    nume: { value: null, matchMode: FilterMatchMode.CONTAINS },
    viteza_maxima: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [page, setPage] = useState(0);
  const [first, setFirst] = useState(0);

  const handleFilter = (evt) => {
    const oldFilters = filters;
    oldFilters[evt.field] = evt.constraints.constraints[0];
    setFilters({ ...oldFilters });
  };

  const handleFilterClear = (evt) => {
    setFilters({
      nume: { value: null, matchMode: FilterMatchMode.CONTAINS },
      viteza_maxima: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
  };

  useEffect(() => {
    const keys = Object.keys(filters);
    const computedFilterString = keys
      .map((e) => {
        return {
          key: e,
          value: filters[e].value,
        };
      })
      .filter((e) => e.value)
      .map((e) => `${e.key}=${e.value}`)
      .join("&");
    setFilterString(computedFilterString);
  }, [filters]);

  const spacecrafts = useSelector(spacecraftSelector);
  const count = useSelector(spacecraftCountSelector);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSpacecrafts(filterString, page, 2, sortField, sortOrder));
  }, [filterString, page, sortField, sortOrder]);

  const handleAddClick = (evt) => {
    setIsDialogShown(true);
    setIsNewRecord(true);
    setNume("");
    setViteza_maxima("");
    setMasa("");
  };

  const hideDialog = () => {
    setIsDialogShown(false);
  };

  const handleSaveClick = () => {
    if (isNewRecord) {
      if (nume.length >= 3 && viteza_maxima >1000 && masa >200) {
        dispatch(addSpacecraft({ nume, viteza_maxima, masa }));
        toast.success("Nava spatiala a fost adaugata!");
        setIsDialogShown(false);
        setSelectedSpacecraft(null);
        setNume("");
        setViteza_maxima("");
        setMasa("");
      } else {
        if (nume.length < 3) {
          toast.error("Numele trebuie sa aiba cel putin 3 caractere!");
        } else if (viteza_maxima <1001 || isNaN(viteza_maxima)) {
          toast.error("Viteza maxima trebuie sa fie mai mare decat 1000!");
        } else if (masa <201 || isNaN(masa)) {
          toast.error("Masa trebuie sa fie mai mare decat 200!");
        }
      }
    } else {
        if (nume.length >= 3 && viteza_maxima >1000 && masa >200) {
        dispatch(
          saveSpacecraft(selectedSpacecraft, { nume, viteza_maxima, masa })
        );
        toast.success("Nava spatiala a fost actualizata!");
        setIsDialogShown(false);
        setSelectedSpacecraft(null);
        setNume("");
        setViteza_maxima(0);
        setMasa(0);
      } else {
        if (nume.length < 3) {
            toast.error("Numele trebuie sa aiba cel putin 3 caractere!");
          } else if (viteza_maxima <1001 || isNaN(viteza_maxima)) {
            toast.error("Viteza maxima trebuie sa fie mai mare decat 1000!");
          } else if (masa <201 || isNaN(masa)) {
            toast.error("Masa trebuie sa fie mai mare decat 200!");
          }
      }
    }
  };

  const editSpacecraft = (rowData) => {
    setSelectedSpacecraft(rowData.id);
    setNume(rowData.nume);
    setViteza_maxima(rowData.viteza_maxima);
    setMasa(rowData.masa);
    setIsDialogShown(true);
    setIsNewRecord(false);
  };

  const handleDeleteSpacecraft = (rowData) => {
    dispatch(deleteSpacecraft(rowData.id));
    toast.success("Nava spatiala a fost stearsa!");
  };

  const handleImportClick = () => {
    dispatch(importSpacecrafts());
    toast.success("Import realizat cu succes!");
    setSelectedSpacecraft(null);
    setNume("");
    setViteza_maxima("");
    setMasa("");
    window.location.reload();
  };

  const handleExportClick = () => {
    dispatch(exportSpacecrafts(spacecrafts));
    toast.success("Export realizat cu succes!");
  };

  const redirect = (rowData) => {
    setSelectedSpacecraft(rowData.id);
    navigate(`/spacecrafts/${rowData.id}/astronauts`);
  };

  const tableFooter = (
    <div className="flex justify-content-around">
      <Button label="Adauga" icon="pi pi-plus" onClick={handleAddClick} />
      <Button label="Import" icon="pi pi-table" onClick={handleImportClick} />
      <Button label="Export" icon="pi pi-save" onClick={handleExportClick} />
    </div>
  );

  const dialogFooter = (
    <div>
      <Button label="Salveaza" icon="pi pi-save" onClick={handleSaveClick} />
    </div>
  );

  const opsColumn = (rowData) => {
    return (
      <>
        <Button className="mx-3"
          label="Editeaza"
          icon="pi pi-pencil"
          onClick={() => editSpacecraft(rowData)}
        />
        <Button className="mx-3"
          label="Sterge"
          icon="pi pi-times"
          className="p-button p-button-danger"
          onClick={() => handleDeleteSpacecraft(rowData)}
        />
        <Button className="mx-3"
          label="Vezi astronauti"
          icon="pi pi-eye"
          onClick={() => redirect(rowData)}
        />
      </>
    );
  };

  const handlePageChange = (evt) => {
    setPage(evt.page);
    setFirst(evt.page * 2);
  };

  const handleSort = (evt) => {
    console.warn(evt);
    setSortField(evt.sortField);
    setSortOrder(evt.sortOrder);
  };

  return (
    <div className="flex flex-column">
      <ToastContainer />
      <div>
          <h3>Lista navelor spatiale:</h3>
      </div>
      <DataTable
        value={spacecrafts}
        footer={tableFooter}
        lazy
        paginator
        onPage={handlePageChange}
        first={first}
        rows={2}
        totalRecords={count}
        onSort={handleSort}
        sortField={sortField}
        sortOrder={sortOrder}
      >
        <Column
          header="Nume"
          field="nume"
          filter
          filterField="nume"
          filterPlaceholder="filtrare dupa nume"
          onFilterApplyClick={handleFilter}
          onFilterClear={handleFilterClear}
          sortable
        />
        <Column
          header="Viteza maxima"
          field="viteza_maxima"
          filter
          filterField="viteza_maxima"
          filterPlaceholder="filtrare dupa viteza_maxima"
          onFilterApplyClick={handleFilter}
          onFilterClear={handleFilterClear}
        />
        <Column header="Masa" field="masa" />

        <Column body={opsColumn} />
      </DataTable>
      <Dialog
        header="Nava spatiala"
        visible={isDialogShown}
        onHide={hideDialog}
        footer={dialogFooter}
      >
        <div>
          <InputText className="mb-2"
            placeholder="Nume"
            onChange={(evt) => setNume(evt.target.value)}
            value={nume}
          />
        </div>
        <div>
          <InputText className="mb-2"
            placeholder="Viteza maxima"
            onChange={(evt) => setViteza_maxima(evt.target.value)}
            value={viteza_maxima}
          />
        </div>
        <div>
          <InputText
            placeholder="Masa"
            onChange={(evt) => setMasa(evt.target.value)}
            value={masa}
          />
        </div>
      </Dialog>
    </div>
  );
}

export default SpacecraftList;
