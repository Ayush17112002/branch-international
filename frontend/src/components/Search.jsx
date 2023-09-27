import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
export default function Search({ setFilteredChats }) {
  const dispatch = useDispatch();
  let chats = useSelector((state) => state.chat.chats);
  const [searchPhrase, setSearchPhrase] = useState("");

  useEffect(() => {
    const id = setTimeout(() => {
      const res = [];
      chats.forEach((chat) => {
        const reg = new RegExp(searchPhrase);
        if (reg.test(chat.userName)) res.push(chat);
      });
      setFilteredChats(res);
    }, 100);
    return () => {
      clearTimeout(id);
    };
  }, [searchPhrase, chats]);
  return (
    <form
      className="search-phrase-input mb-2 bg-blue-100 border-2 rounded-lg flex flex-row w-full h-[8%]"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <input
        type="text"
        placeholder="Search Customer..."
        className="relative w-full pl-4 pr-4 rounded-lg"
        value={searchPhrase}
        onChange={(e) => {
          setSearchPhrase(e.target.value);
        }}
      ></input>
      <button className="flex items-center justify-center w-[3%]">🔎</button>
    </form>
  );
}
