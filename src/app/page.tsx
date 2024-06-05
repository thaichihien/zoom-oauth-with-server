"use client";

import FetchButton from "./components/FetchButton";
import "./globals.css";
import { FormEvent, useState } from "react";

export default function Home() {
  const [account, setAccount] = useState<{
    is_authorized: boolean;
    access_token?: string;
  }>({
    is_authorized: false,
  });
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    console.log(JSON.stringify(Object.fromEntries(formData)));

    const response = await fetch("http://localhost:4000/auth/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    const resBody = await response.json();
    if (response.ok) {
      setAccount({
        is_authorized: true,
        access_token: resBody.accessToken,
      });
      localStorage.setItem("access_token", resBody.accessToken);
    } else {
      console.log(resBody);

      setError(resBody.message);
    }
  }

  return (
    <main>
      {!account.is_authorized ? (
        <form onSubmit={handleLogin} className=" flex flex-col">
          <input
            className="m-2 p-2 border-2 rounded-md border-black w-1/3"
            type="email"
            name="email"
            placeholder="Enter email..."
          />
          <input
            className="m-2 p-2 border-2 rounded-md border-black w-1/3"
            type="password"
            name="password"
            placeholder="Enter password"
          />
          <button
            type="submit"
            className="p-4 rounded-lg bg-green-600 w-1/3 m-2 "
          >
            Login
          </button>
          <h4 className="  text-red-600">{error}</h4>
        </form>
      ) : (
        <div>
          <h2 className=" m-2 text-green-600">Login successfully</h2>
          <FetchButton accessToken={account.access_token!} />
        </div>
      )}
    </main>
  );
}
