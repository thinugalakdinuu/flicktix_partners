import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { client } from "@/lib/client";

import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoEllipsisHorizontalOutline } from "react-icons/io5";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const Tickets = ({ partner }) => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [bookingId, setBookingId] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const router = useRouter();

  useEffect(() => {
    const fetchTheaterAndBookings = async () => {
      const storedTheaterId = sessionStorage.getItem("theater_id");

      if (!storedTheaterId) return;

      const theater = await client.fetch(
        `*[_type == "theater" && _id == $id][0]{ theaterName }`,
        { id: storedTheaterId }
      );

      const currentTheaterName = theater?.theaterName;

      if (!currentTheaterName) return;

      const bookings = await client.fetch(
        `*[_type == "booking" && theaterName == $name] | order(createdAt desc)`,
        { name: currentTheaterName }
      );

      setData(bookings);
      setFiltered(bookings);
    };

    fetchTheaterAndBookings();
  }, []);

  useEffect(() => {
    let result = data;

    if (bookingId) {
      result = result.filter((b) =>
        b.bookingId.toLowerCase().includes(bookingId.toLowerCase())
      );
    }

    if (status) {
      result = result.filter((b) => b.ticketStatus === status);
    }

    if (date) {
      result = result.filter((b) => b.showDate === date);
    }

    setCurrentPage(1); // Reset to first page on filter change
    setFiltered(result);
  }, [bookingId, status, date, data]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">All Bookings</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search by Booking ID"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          className="w-60"
        />
        <Select onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="redeemed">Redeemed</SelectItem>
          </SelectContent>
        </Select>

        {/* Popover for Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Input
              type="text"
              value={date ? format(new Date(date), "yyyy-MM-dd") : ""}
              placeholder="Select Date"
              readOnly
              className="w-48"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              selected={date ? new Date(date) : null}
              onChange={(newDate) => setDate(format(newDate, "yyyy-MM-dd"))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Booking ID</TableHead>
              <TableHead className="w-40">Movie</TableHead>
              <TableHead className="w-32">Date Created</TableHead>
              <TableHead className="w-40">Seats</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-10 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((b) => (
                <TableRow key={b._id}>
                  <TableCell>{b.bookingId}</TableCell>
                  <TableCell>{b.movieName}</TableCell>
                  <TableCell>
                    {new Date(b.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {b.selectedSeats?.slice(0, 3).join(", ")}
                    {b.selectedSeats?.length > 3 && " ..."}
                  </TableCell>
                  <TableCell className="capitalize">
                    <div
                      className={`w-fit h-fit py-[1px] px-2 rounded-md border 
                        ${
                          b.ticketStatus === "reserved"
                            ? "border-blue-600 bg-[#F4F6F5] text-blue-600"
                            : b.ticketStatus === "redeemed"
                              ? "border-green-600 bg-[#F4F6F5] text-green-600"
                              : "border-gray-500 bg-[#F4F6F5] text-gray-500"
                        }`}
                    >
                      {b.ticketStatus}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none hover:bg-gray-100 transition duration-200 p-1 rounded-sm cursor-pointer">
                        <IoEllipsisHorizontalOutline className="h-5 w-5 cursor-pointer" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/dashboard/tickets/${b.uniqueBookingId}`
                            )
                          }
                        >
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="cursor-pointer"
          >
            <IoChevronBack />
            <p>Previous</p>
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="cursor-pointer"
          >
            <p>Next</p>
            <IoChevronForward />
          </Button>
        </div>
      )}
    </div>
  );
};

Tickets.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Tickets;
