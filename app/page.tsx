"use client";

import { useStore } from "../src/store/useStore";
import clsx from "clsx";

export default function Home() {
  const darkMode = useStore((state) => state.dark);
  const toggleDarkMode = useStore((state) => state.toggleDark);

  return (
    <main
      className={clsx(
        "flex min-h-screen items-center justify-center px-4 ",
        darkMode ? "dark bg-black" : "bg-gray-50"
      )}>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-zinc-500 bg-white dark:bg-zinc-800 p-8 shadow-lg">
        <h1 className="text-3xl  text-gray-600 font-extrabold text-center dark:text-gray-300">
          Welcome to
        </h1>
        <h1 className="text-3xl text-zinc-900 font-extrabold text-center dark:text-white">
          Next-JS-PostgreSQL
        </h1>

        <p className="mt-3 text-center text-gray-600 dark:text-gray-400">
          <i>Build fast. Ship faster. Scale smarter.</i>
        </p>

        <div className="mt-8 flex flex-col gap-4 ">
          <a href="/auth/login"
            className="w-full text-center rounded-lg border border-gray-300 py-2 text-lime-800 dark:text-gray-100 hover:bg-lime-600  hover:text-white">
            Go to sign-in
          </a>

          <a href="/feed"
            className="w-full text-center rounded-lg border border-gray-300 dark:border-gray-700 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-600  hover:text-white">
            Go to Dashboard
          </a>

          <button
            onClick={toggleDarkMode} className="w-full text-lg text-blue-600 rounded-lg border  border-gray-300  hover:bg-blue-600 hover:text-white">Switch to {darkMode ? "Light" : "Dark"} Mode
          </button>

        </div>
      </div>
    </main>
  );
}
