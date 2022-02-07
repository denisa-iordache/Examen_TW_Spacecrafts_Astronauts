import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { SelectButton } from "primereact/selectbutton";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  getAstronauts,
  addAstronaut,
  saveAstronaut,
  deleteAstronaut,
} from "../actions";

const astronautSelector = (state) => state.astronaut.astronautList;

function AstronautList() {
  const [isDialogShown, setIsDialogShown] = useState(false);
  const [nume, setNume] = useState("");
  const [rol, setRol] = useState("");
  const [isNewRecord, setIsNewRecord] = useState(true);
  const [selectedAstronaut, setSelectedAstronaut] = useState(null);
  const navigate = useNavigate();
  const astronauts = useSelector(astronautSelector);

  const dispatch = useDispatch();
  const { spacecraftId } = useParams();

  useEffect(() => {
    dispatch(getAstronauts(spacecraftId));
  }, [spacecraftId]);

  const handleAddClick = (evt) => {
    setIsDialogShown(true);
    setIsNewRecord(true);
    setNume("");
    setRol("");
  };

  const hideDialog = () => {
    setIsDialogShown(false);
  };

  const handleSaveClick = () => {
    if (isNewRecord) {
      if (nume.length >= 5 && rol != null) {
        dispatch(addAstronaut(spacecraftId, { nume, rol }));
        toast.success("Astronaut adaugat!");
        setIsDialogShown(false);
        setSelectedAstronaut(null);
        setNume("");
        setRol("");
      } else {
        if (nume.length < 5) {
          toast.error("Numele trebuie sa aiba cel putin 5 caractere!");
        } else if (rol == null) {
          toast.error("Selectati un rol!!");
        }
      }
    } else {
      if (nume.length >= 5 && rol != null) {
        dispatch(saveAstronaut(spacecraftId, { nume, rol }, selectedAstronaut));
        toast.success("Astronaut actualizat!");
        setIsDialogShown(false);
        setSelectedAstronaut(null);
        setNume("");
        setRol("");
      } else {
        if (nume.length < 5) {
          toast.error("Numele trebuie sa aiba cel putin 5 caractere!");
        } else if (rol == null) {
          toast.error("Selectati un rol!!");
        }
      }
    }
  };

  const editAstronaut = (rowData) => {
    setSelectedAstronaut(rowData.id);
    setNume(rowData.nume);
    setRol(rowData.rol);
    setIsDialogShown(true);
    setIsNewRecord(false);
  };

  const handleDeleteAstronaut = (rowData) => {
    dispatch(deleteAstronaut(spacecraftId, rowData.id));
    toast.success("Astronaut sters!");
  };

  const redirect = () => {
    navigate(`/`);
  };

  const tableFooter = (
    <div className="flex justify-content-around">
      <Button 
        label="Adauga un astronaut"
        icon="pi pi-plus"
        onClick={handleAddClick}
      />
      <Button 
        label="Inapoi la lista navelor spatiale"
        icon="pi pi-sign-out"
        onClick={redirect}
      />
    </div>
  );

  const dialogFooter = (
    <div>
      <Button 
        label="Salveaza astronautul"
        icon="pi pi-save"
        onClick={handleSaveClick}
      />
    </div>
  );

  const opsColumn = (rowData) => {
    return (
      <>
        <Button className="mx-3"
          label="Editeaza astronautul"
          icon="pi pi-pencil"
          onClick={() => editAstronaut(rowData)}
        />
        <Button className="mx-3"
          label="Sterge astronautul"
          icon="pi pi-times"
          className="p-button p-button-danger"
          onClick={() => handleDeleteAstronaut(rowData)}
        />
      </>
    );
  };

  const options = [
    { value: "COMMANDER", label: "COMMANDER" },
    { value: "PILOT", label: "PILOT" },
  ];

  return (
    <div>
      <ToastContainer />
      <div>
          <h3>Lista astronautilor:</h3>
      </div>
      <DataTable value={astronauts} footer={tableFooter} lazy>
        <Column header="Nume" field="nume" />
        <Column header="Rol" field="rol" />

        <Column body={opsColumn} />
      </DataTable>
      <Dialog
        header="Astronaut"
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
          <SelectButton
            options={options}
            value={rol}
            onChange={(evt) => setRol(evt.target.value)}
          />
        </div>
      </Dialog>
    </div>
  );
}

export default AstronautList;
