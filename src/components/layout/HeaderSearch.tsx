"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HeaderSearchProps = {
  searchQuery: string;
  selectedCategoryId?: string;
};

export default function HeaderSearch({
  searchQuery,
  selectedCategoryId,
}: HeaderSearchProps) {
  const [query, setQuery] = useState(searchQuery);

  return (
    <form
      action="/"
      role="search"
      className="relative order-4 h-10 w-full sm:order-none sm:ml-auto sm:w-48 md:w-64 lg:w-80"
    >
      <Label htmlFor="header-course-search" className="sr-only">
        Tìm kiếm khóa học
      </Label>
      <Input
        id="header-course-search"
        name="q"
        type="search"
        autoComplete="off"
        value={query}
        onValueChange={setQuery}
        placeholder="Tìm khóa học..."
        className="h-10 rounded-full border-blue-200 bg-blue-50 pr-3 pl-10 text-base text-slate-900 placeholder:text-slate-500 focus-visible:border-blue-600 focus-visible:bg-white focus-visible:ring-blue-100 sm:text-xs"
      />
      {selectedCategoryId ? (
        <input type="hidden" name="category" value={selectedCategoryId} />
      ) : null}
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label="Tìm kiếm"
        className="absolute inset-y-1 left-1 size-8 cursor-pointer rounded-full text-slate-500 hover:bg-white hover:text-blue-700 focus-visible:border-transparent focus-visible:ring-blue-600"
      >
        <Search aria-hidden="true" className="size-4" />
      </Button>
    </form>
  );
}
