"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const accessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJjaGloaWVuQGdtYWlsLmNvbSIsInJvbGUiOiJST09UX0FETUlOIiwiY29tcGFueV9pZCI6IjEiLCJ0eXBlIjoiQUNDT1VOVCIsImlhdCI6MTcxNzMzNTE5NiwiZXhwIjoxNzE3MzM4Nzk2fQ.DEB2Qaa8metEuwWFelWsXQCNTX2Ujxo2tcDyIloA5L0";

const ZoomCodeSection = () => {
  const [code, setCode] = useState("");
  const searchParams = useSearchParams();

  const search = searchParams.get("code");

  async function saveZoomCode(code: string) {
    try {
      const accessToken =  localStorage.getItem('access_token') // Please use refresh token to get new access token 
      const res = await fetch("http://localhost:4000/zoom/authorize", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
        }),
      });

      if (!res.ok) {
        console.log(res);
        const err = await res.json();
        console.log(err);

        return;
      }

      const body: {
        is_zoom_authorized: boolean;
        url?: string | undefined;
      } = await res.json();

      if (body.is_zoom_authorized) {
        window.close();
      } else {
        console.log(body);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (search) {
      setCode(search);
      saveZoomCode(search);
    }
  }, [search]);

  useEffect(() => {
    if (window) {
      window.addEventListener("beforeunload", () => {
        window.opener.postMessage("childWindowClosed", window.location.origin);
      });
    }
  }, []);

  return (
    <div>
      <h3>Code :</h3>
      <p>{code}</p>
    </div>
  );
};

export default ZoomCodeSection;
