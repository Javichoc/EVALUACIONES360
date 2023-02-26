
    /*------------ ENDPOINTS  REST API SHAREPOINT --------------------*/

    /* 
        -> solicitudCreate : item de la lista con sus columnas y valor : este item debe ser tipo objeto 
        -> listaNombre : nombre de la lista sharepoint donde se va a crear el item
    */
    function createItemSp({ solicitudCreate, listaNombre }) {
        var result = null;
        var item = {
            ...solicitudCreate,
            __metadata: {
                type: GetItemTypeForListName(listaNombre),
            },
        };
        $.ajax({
            url:
                _spPageContextInfo.webAbsoluteUrl +
                `/_api/web/lists/getbytitle('${listaNombre}')/items`,
            type: "POST",
            data: JSON.stringify(item),
            async: false,
            headers: {
                Accept: "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "Content-Type": "application/json;odata=verbose",
            },
            success: function (data) {
                result = {
                    ok: true,
                    data: data,
                };
            },
            error: function (data) {
                result = {
                    ok: false,
                    data: null,
                    message: data.responseJSON?.error?.message?.value,
                };
            },
        });
        return result;
    }

    /* 
        -> solicitudUpdate : item de la lista con sus columnas y valor : este item debe ser tipo objeto 
        -> listaNombre : nombre de la lista o biblioteca documental sharepoint donde se va a actualizar el item
        -> idSolicitud : Id del item que se va a actualizar
        -> esCarpeta : se debe poner en true cuando se actualiza items en una bibioteca documental
    */
    function updateItemSp({
        solicitudUpdate,
        listaNombre,
        idSolicitud,
        esCarpeta = false
    }) {
        var result = null;
        var item = {
            __metadata: { type: esCarpeta ? GetItemTypeForFolderName(listaNombre) : GetItemTypeForListName(listaNombre) },
            ...solicitudUpdate,
        };
        $.ajax({
            url:
                _spPageContextInfo.webAbsoluteUrl +
                `/_api/Web/Lists/getByTitle('${listaNombre}')/Items(${idSolicitud})`,
            type: "PATCH",
            async: false,
            headers: {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "IF-MATCH": "*",
                "X-Http-Method": "PATCH"
            },
            data: JSON.stringify(item),
            success: function (data) {
                result = {
                    ok: true,
                    data: data,
                };
            },
            error: function (data) {
                result = {
                    ok: false,
                    data: null,
                    message: data.responseJSON?.error?.message?.value,
                };
            },
        });


        return result;
    }


    /* 
        -> listaNombre : nombre de la lista o biblioteca documental sharepoint donde se va a eliminar el item
        -> idSolicitud : Id del item que se va a eliminar
    */
    function deleteItemSp({
        listaNombre,
        idSolicitud
    }) {
        var result = null;
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + `/_api/web/lists/getByTitle('${listaNombre}')/items(${idSolicitud})`,
            type: "POST",
            async: false,
            headers:
            {
                "Accept": "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "IF-MATCH": "*",
                "X-HTTP-Method": "DELETE",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },

            success: function (data) {
                result = {
                    ok: true,
                    data: data,
                };
            },
            error: function (data) {
                result = {
                    ok: false,
                    data: null,
                    message: data.responseJSON?.error?.message?.value,
                };
            },
        });


        return result;
    }


    /* 
        -> listaNombre : nombre de la lista o biblioteca documental sharepoint donde se va a actualizar el item
        -> idSolicitud : Id del item que se va a recuperar no devielve un array si no un objeto
        -> top : se puede definir el numero de elementos a traer por defectotra el 1000 
        -> columns : define las columnas de la lista a obtener por defecto trae todas 
        -> filter : define el los filtros aplicar a la consulta
        -> expand : cuando en el fltro se hace referencia a una columna tipo busqueda
    */
    function getDataSp({
        listaNombre,
        idSolicitud = 0,
        top = 1000,
        colums = "*",
        filter = "",
        expand = "",
        orderColum = "ID",
        orderType = "desc",
    }) {
        var query = `/_api/Web/Lists/GetByTitle('${listaNombre}')/items`;

        /* obtener toda la lista o un item */
        query += idSolicitud != 0 ? `(${idSolicitud})?` : "?";
        /* columnas a traer */
        query += colums != "" ? `$select=${colums}` : `$select=*`;

        /* expand */
        query += expand != "" ? `&$expand=${expand}` : "";
        /* filter */
        query += filter != "" ? `&$filter=${filter}` : "";
        /* top */
        if (idSolicitud == 0) {
            query += `&$top=${top == "" ? "5000" : top}`;
        }

        if (idSolicitud == 0) {
            if (orderColum != "") {
                query += `&$orderBy=${orderColum} ${orderType == "" ? "desc" : orderType}`;
            }
        }

        var result = null;
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + query,
            type: "GET",
            async: false,
            headers: { Accept: "application/json;odata=verbose" },
            success: function (data) {
                result = {
                    ok: true,
                    data: data.d,
                };
            },
            error: function (data) {
                result = {
                    ok: false,
                    data: null,
                    message: data.responseJSON?.error?.message?.value,
                };
            },
        });
        return result;
    }

    /* 
        -> folder : nombre de la biblioteca documental sharepoint donde se va obtener la  informacion
        -> getFolder : parameto para obtener las carpteas por defecto es true para obtener las carpetas
        -> getFiles: parameto para obtener los archivos por defecto es true para obtener los archivos
    */
    function getDataFolderSp({
        folder,
        getFolder = true,
        getFiles = true,
    }) {
        var query = `/_api/web/GetFolderByServerRelativeUrl('${folder}')?$expand=`;
        if (getFolder) {
            query += `Folders,Folders/ListItemAllFields,Folders/Author,Folders/Acceso,Folders/ListItemAllFields/FieldValuesAsText/File_x005f_x0020_x005f_Type`;
        }
        if (getFiles) {
            query += `Files,Files/ListItemAllFields,Files/Author,Files/ListItemAllFields/FieldValuesAsText/File_x005f_x0020_x005f_Type`;
        }
        var result = null;
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + query,
            type: "GET",
            async: false,
            headers: { Accept: "application/json;odata=verbose" },
            success: function (data) {
                result = {
                    ok: true,
                    data: data.d,
                };
            },
            error: function (data) {
                result = {
                    ok: false,
                    data: null,
                    message: data.responseJSON?.error?.message?.value,
                };
            },
        });
        return result;
    }

    /* 
        -> carpetaPadre : nombre de la biblioteca documental sharepoint donde se va a crear la  carpeta
        -> nombreCarpeta : nombre de la carpeta con que se va a crear 
    */
    function createFolderSp({ carpetaPadre, nombreCarpeta,columsAdd }) {
        var result = null;
        var urlCarpeta = carpetaPadre + "/" + nombreCarpeta;
        var fullUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/folders";

        var dataSoli = {
            __metadata: { type: "SP.Folder" },
            ServerRelativeUrl: urlCarpeta,
            ...columsAdd
        }


        $.ajax({
            url: fullUrl,
            type: "POST",
            contentType: "application/json;odata=verbose",
            async: false,
            data: JSON.stringify(dataSoli),
            headers: {
                accept: "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
            },
            success: function (data) {
                result = {
                    ok: true,
                    data: data,
                };
            },
            error: function (error) {
                result = {
                    ok: false,
                    data: null,
                    message: error.responseJSON?.error?.message?.value,
                };
            },
        });
        return result;
    }

    function GetItemTypeForListName(name) {
        return (
            "SP.Data." +
            name.charAt(0).toUpperCase() +
            name.split(" ").join("").slice(1) +
            "ListItem"
        );
    }

    function GetItemTypeForFolderName(name) {
        return (
            "SP.Data." +
            name.charAt(0).toUpperCase() +
            name.split(" ").join("").slice(1) +
            "Item"
        );
    }
    
    
    /* upload filtes */
    /* 
        -> idControl : id del input type file de referencia
        -> carpeta : nombre de la carpeta con que se va a subir los documentos 
        -> columsAdd : item de la lista con sus columnas y valor : este item debe ser tipo objeto
        -> modifiName : modifica el nombre de los archivos con anio mes y dia  al inicio  
        -> sufijoNombre : modifica el nombre con un sufijo al incio 
        -> callback : recive la funcion y la ejecuta cuando finaliza la subida de archivos ->obligado se lo debe llmar de esta forma en el objeto callback: (e) => funcionalfinalizar(e)  -> funcionalfinalizar = a la funcion que se ejecutara 
    */
    function uploadItemsSp({ idControl, carpeta, columsAdd, modifiName = false, sufijoNombre = '', callback }) {
        var serverRelativeUrlToFolder = carpeta;
        var fileInput = $(`#${idControl}`);

        var fileCount = fileInput[0].files.length;
        var serverUrl = _spPageContextInfo.webAbsoluteUrl;
        var filesUploaded = 0;
        var a_nombresArch = [];

        for (var index = 0; index < fileCount; index++) {
            var nombre = "";
            if (modifiName) {
                var dateFile = obtenerFechaDocumento();
                nombre = dateFile + "_" + fileInput[0].files[index].name;
            } else {
                nombre = fileInput[0].files[index].name;
            }

            if (sufijoNombre != '') {
                nombre = sufijoNombre +'_' +nombre
            }

            a_nombresArch.push(nombre);
        }

        for (var i = 0; i < fileCount; i++) {

            var getFile = getFileBuffer(i);
            getFile.done(function (arrayBuffer, i) {
                var addFile = addFileToFolder(arrayBuffer, i);
                addFile.done(function (file, status, xhr) {
                    var getItem = getListItem(file.d.ListItemAllFields.__deferred.uri);
                    getItem.done(function (listItem, status, xhr) {
                        var changeItem = updateListItem(listItem.d.__metadata, i);
                        changeItem.done(function (data, status, xhr) {
                            filesUploaded++;
                            if (fileCount == filesUploaded) {

                                callback({
                                    ok: true,
                                    message: "upload success",
                                })
                            }
                        });
                        changeItem.fail(function (e) {
                            callback({
                                ok: false,
                                message: e.responseJSON?.error?.message?.value,
                            })

                        });
                    });
                    getItem.fail(function (e) {
                        callback({
                            ok: false,
                            message: e.responseJSON?.error?.message?.value,
                        })
                    });
                });
                addFile.fail(function (e) {
                    callback({
                        ok: false,
                        message: e.responseJSON?.error?.message?.value,
                    })
                });
            });
            getFile.fail(function (e) {
                callback({
                    ok: false,
                    message: e.responseJSON?.error?.message?.value,
                })
            });
        }


        function getFileBuffer(i) {
            var deferred = jQuery.Deferred();
            var reader = new FileReader();
            reader.onloadend = function (e) {
                deferred.resolve(e.target.result, i);
            };
            reader.onerror = function (e) {
                deferred.reject(e.target.error);
            };
            reader.readAsArrayBuffer(fileInput[0].files[i]);
            return deferred.promise();
        }

        function addFileToFolder(arrayBuffer, i) {
            var fileCollectionEndpoint = String.format(
                "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
                "/add(overwrite=true, url='{2}')",
                serverUrl,
                serverRelativeUrlToFolder,
                a_nombresArch[i]
            );
            return jQuery.ajax({
                url: fileCollectionEndpoint,
                type: "POST",
                data: arrayBuffer,
                processData: false,
                headers: {
                    accept: "application/json;odata=verbose",
                    "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                    "content-length": arrayBuffer.byteLength,
                },
            });
        }
        function getListItem(fileListItemUri) {
            return jQuery.ajax({
                url: fileListItemUri,
                type: "GET",
                headers: { accept: "application/json;odata=verbose" },
            });
        }

        function updateListItem(itemMetadata, i) {
            var item = {
                FileLeafRef: a_nombresArch[i],
                Title: a_nombresArch[i],
                __metadata: {
                    type: itemMetadata.type,
                },
                ...columsAdd,
            };
            return jQuery.ajax({
                url: itemMetadata.uri,
                type: "POST",
                data: JSON.stringify(item),
                headers: {
                    "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                    "content-type": "application/json;odata=verbose",
                    "content-length": Object.keys(item).length,
                    "IF-MATCH": itemMetadata.etag,
                    "X-HTTP-Method": "MERGE",
                },
            });
        }


    }

    function obtenerFechaDocumento() {
        var currentDate = new Date();
        var day =
            currentDate.getDate() < 10
                ? "0" + currentDate.getDate()
                : currentDate.getDate();
        var montPrev = currentDate.getMonth() + 1;
        var mont = montPrev < 10 ? "0" + montPrev : montPrev;
        return `${currentDate.getFullYear()}${mont}${day}`;
    }
