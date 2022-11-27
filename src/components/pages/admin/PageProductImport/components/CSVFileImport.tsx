import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios, { AxiosResponse } from 'axios';

type CSVFileImportProps = {
  url: string;
  title: string;
};

type ImportHeaders = {
  Authorization?: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);

    if (!file) {
      return;
    }

    const headers: ImportHeaders = {};
    const token = localStorage.getItem("authorization_token");
    if (token) headers.Authorization = token;

    // Get the presigned URL
    let response: AxiosResponse | undefined = undefined;

    try {
      response = await axios({
        method: "GET",
        url,
        headers,
        params: {
          name: encodeURIComponent(file.name),
        },
      });
    } catch (error: any) {
      if (error.response.status === 401 || error.response.status === 403) {
        const message =
          error.response.status === 401
            ? "401 - Unauthorized"
            : "403 - Forbidden";

        alert(message);
      }
    }

    if (!response) return;

    console.log("File to upload: ", file!.name);
    console.log("Uploading to: ", response.data);
    const result = await fetch(response.data.signedUrl, {
      method: "PUT",
      body: file,
    });
    console.log("Result: ", result);
    setFile(undefined);
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
