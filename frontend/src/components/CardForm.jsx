/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import fileTypeChecker from "file-type-checker";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import usePrefersColorScheme from "use-prefers-color-scheme";

function CardForm({
  data,
  modifyData,
  indexImg,
  decrementIndex,
  incrementIndex,
  setImageIndex,
}) {
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [isDragged, setIsDragged] = useState(false);

  const prefersColorScheme = usePrefersColorScheme();
  const colorScheme = prefersColorScheme === "dark" ? "light" : "dark";

  useEffect(() => {
    //console.log(categoriasSeleccionadas);
    modifyData("categories", ...categoriasSeleccionadas);
  }, [categoriasSeleccionadas]);

  console.log(data);

  if(data?.lat.length > 0 && data?.lng.length > 0 && data?.url.length === 0){

  }

  const categorias = [
    "Almuerzos",
    "Argentino",
    "Asiatico",
    "Bocadillos",
    "Buffet",
    "Croquetas",
    "Desayunos",
    "Hamburguesas",
    "Horchateria",
    "Hotpot",
    "Mexicano",
    "Paella",
    "Parrilla",
    "Pasta",
    "Pizza",
    "Ramen",
    "Sushi",
    "Tacos",
    "Tapas",
    "Tortilla",
  ];

  function handleCategorias(categoria) {
    if (data.categories.length === 0) setCategoriasSeleccionadas([]);

    categoriasSeleccionadas.includes(categoria)
      ? setCategoriasSeleccionadas((prevCategorias) =>
          prevCategorias.filter((categ) => categ != categoria)
        )
      : setCategoriasSeleccionadas((prevCategorias) => [
          ...prevCategorias,
          categoria,
        ]);
  }

  const notifyOk = () =>
    toast.success("Envío exitoso 😄", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: colorScheme,
    });
  const notifyError = () =>
    toast.error("Error 😟", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: colorScheme,
    });
  const notifyDuplicate = () =>
    toast.error("No se ha actualizado", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: colorScheme,
    });
  const notifyUpdated = () =>
    toast.info("Actualizado con éxito ⟲", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: colorScheme,
    });

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  async function addImage(image) {
    await toBase64(image)
      .then((result) => modifyData("photos", [...data.photos, result]))
      .catch((error) => console.log(error));
  }

  function handleFileUpload(file) {
    const types = ["jpeg", "png", "gif", "webp"];
    // const file = event.target.files[0];
    const maxAllowedSize = 5 * 1024 * 1024; //5MB;
    if (file.size > maxAllowedSize) {
      alert("Archivo demasiado grande. Max 50MB");
      return;
    }

    try {
      if (file) {
        const fileReader = new FileReader();

        fileReader.onload = async () => {
          const isImage = fileTypeChecker.validateFileType(
            fileReader.result,
            types
          );

          if (!isImage) {
            alert(
              "Solo estan soportados los formatos .jpeg, .png, .jpg, .webp y .gif. Intentelo de nuevo."
            );
            return;
          }
          await addImage(file);
          setImageIndex(() => data?.photos?.length);
        };

        fileReader.readAsArrayBuffer(file);
      }
    } catch (err) {
      console.error("Error: ", err.message);
    }
  }

  const UpdateImage = () => {
    return (
      <div className="update_image">
        <div className="update">
          <label htmlFor="image" className="image_text">
            Subir imagen: <strong className="subtext">(Max 5MB)</strong>
          </label>
          <input
            type="file"
            name="image"
            title="Subir un archivo"
            id="image"
            accept=".gif,.jpeg,.png,.jpg,.webp"
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
        </div>
        <div className="img_selector">
          <button onClick={() => decrementIndex()} className="button_counter">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <span>
            {indexImg + 1}/{data?.photos?.length}
          </span>
          <button onClick={() => incrementIndex()} className="button_counter">
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>
    );
  };

  async function handleSubmitData() {
    const baseURL = "http://localhost:4000";
    const postData = {
      ...data,
      //photos: ""
      photos: data?.photos[indexImg],
    };
    console.log(postData);
    await axios
      .post(`${baseURL}/cards`, postData)
      .then((res) => {
        console.log(res);

        if (res.status === 200 && res.data === "OK") {
          notifyOk();
        } else if (res.status === 200 && res.data === "DUPLICATE") {
          notifyDuplicate();
        } else if (res.status === 200 && res.data === "UPDATED") {
          notifyUpdated();
        } else {
          notifyError();
        }
      })
      .catch((err) => {
        console.log(err);
        notifyError();
      });
  }

  function handleOnDragExit(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragged(false);
  }

  function handleOnDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files[0]);
    setIsDragged(false);
  }

  function handleOnDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragged(true);
  }

  function handleOnDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragged(true);
  }

  function updateLatGmapsUrl(newLat){
    let gMapsQuery = "https://www.google.com/maps/search/?api=1&query=";
    gMapsQuery += newLat + "," + data?.lng;
    console.log("GMAPS URL", gMapsQuery);

    modifyData("url", gMapsQuery)
  }

  function updateLngGmapsUrl(newLng){
    let gMapsQuery = "https://www.google.com/maps/search/?api=1&query=";
    gMapsQuery += data?.lat + "," + newLng;
    console.log("GMAPS URL", gMapsQuery);

    modifyData("url", gMapsQuery)
  }

  return (
    <>
      <div
        className={`edit_params ${isDragged ? "hover_upload_file" : ""}`}
        onDrop={handleOnDrop}
        onDragEnter={handleOnDragEnter}
        onDragOver={handleOnDragOver}
        onDragLeave={handleOnDragExit}
      >
        {isDragged ? (
          <p className="upload_text">Suelta para subir</p>
        ) : (
          <>
            <UpdateImage></UpdateImage>
            <div className="categorias">
              {categorias.map((categoria) => {
                return (
                  <div key={categoria}>
                    <input
                      type="checkbox"
                      id={categoria}
                      title={categoria}
                      checked={data?.categories?.includes(categoria)}
                      value={categoria}
                      name={categoria}
                      onChange={() => handleCategorias(categoria)}
                    />
                    <label htmlFor={categoria}>{categoria}</label>
                  </div>
                );
              })}
            </div>
            <div className="form_row">
              <div>
                <label htmlFor="description">Nombre: </label>
                <input
                  type="text"
                  name="description"
                  id="description"
                  value={data?.name}
                  onChange={(e) => {
                    modifyData("name", e.target.value);
                  }}
                />
              </div>
              <div>
                <label htmlFor="rating">Valoración: </label>
                <input
                  type="number"
                  max={5}
                  step={0.1}
                  name="rating"
                  id="rating"
                  value={data?.rating}
                  onChange={(e) => {
                    modifyData("rating", e.target.value.replace(",", "."));
                  }}
                />
              </div>
            </div>

            <div className="form_row">
              <div>
                <label htmlFor="address">Dirección: </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={data?.address}
                  onChange={(e) => {
                    modifyData("address", e.target.value);
                  }}
                />
              </div>
              <div>
                <label htmlFor="pricing">Coste: </label>
                {/* <input
                  type="number"
                  name="pricing"
                  id="pricing"
                  min="0"
                  max="3"
                  value={isNaN(data?.priceLevel) ? 0 : data?.priceLevel}
                  onChange={(e) => {
                    modifyData(
                      "priceLevel",
                      isNaN(e.target.value) ? 0 : e.target.value
                    );
                  }}
                /> */}
                <select
                  name="pricing"
                  id="pricing"
                  value={isNaN(data?.priceLevel) ? 0 : data?.priceLevel}
                  onChange={(e) => {
                    modifyData(
                      "priceLevel",
                      isNaN(e.target.value) ? 0 : e.target.value
                    );
                  }}
                >
                  {data?.priceLevel === 0 ? (
                    <option value="0" disabled>
                      Selecciona
                    </option>
                  ) : (
                    <></>
                  )}
                  <option value="1">Bajo</option>
                  <option value="2">Medio</option>
                  <option value="3">Alto</option>
                </select>
              </div>
            </div>
            <div className="form_row">
              <div>
                <label htmlFor="website">Sitio Web: </label>
                <input
                  type="text"
                  name="website"
                  id="website"
                  value={data?.website}
                  onChange={(e) => {
                    modifyData("website", e.target.value);
                  }}
                />
              </div>
              <div>
                <label htmlFor="telephone">Teléfono: </label>
                <input
                  type="text"
                  name="telephone"
                  id="telephone"
                  value={data?.telephone}
                  onChange={(e) => {
                    modifyData("telephone", e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="form_row">
            <div>
                <label htmlFor="gmaps">Gmaps:</label>
                <input
                  className="gmaps"
                  type="text"
                  name="url"
                  id="url"
                  value={data?.url}
                  onChange={(e) => {
                    modifyData("url", e.target.value);
                  }}
                />
              </div>
              <div>
                <label htmlFor="lat">Lat:</label>
                <input
                  type="number"
                  className="coord"
                  name="lat"
                  id="lat"
                  step={0.0001}
                  value={data?.lat}
                  onChange={(e) => {
                    modifyData("lat", e.target.value);
                    updateLatGmapsUrl(e.target.value);
                  }}
                />
              </div>
              <div>
                <label htmlFor="lng">Lng:</label>
                <input
                  type="number"
                  className="coord"
                  name="lng"
                  id="lng"
                  step={0.0001}
                  value={data?.lng}
                  onChange={(e) => {
                    modifyData("lng", e.target.value);
                    updateLngGmapsUrl(e.target.value);
                  }}
                />
              </div>
              
            </div>
            <button
              onClick={() => handleSubmitData()}
              className="button_send button_search"
            >
              ENVIAR
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default CardForm;
