import React, { useState } from "react";
import { useRouter } from "next/router";
import { client } from "@/lib/client"; // Your client import

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
import { IoEllipsisHorizontal } from "react-icons/io5";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"; // ShadCN Popover
import { Calendar } from "@/components/ui/calendar"; // ShadCN Calendar
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

import { format } from "date-fns";

const Redeemed = ({ bookings }) => {
  const [filtered, setFiltered] = useState(bookings);
  const [bookingId, setBookingId] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Set the number of items per page
  const router = useRouter();

  // Filter booking data based on ID and date
  const filterData = () => {
    let result = bookings;

    if (bookingId) {
      result = result.filter((b) =>
        b.bookingId.toLowerCase().includes(bookingId.toLowerCase())
      );
    }

    if (date) {
      result = result.filter((b) => b.showDate === date);
    }

    setFiltered(result);
  };

  // Pagination logic
  const indexOfLastBooking = currentPage * itemsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - itemsPerPage;
  const currentBookings = filtered.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Redeemed Bookings</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search by Booking ID"
          value={bookingId}
          onChange={(e) => {
            setBookingId(e.target.value);
            filterData();
          }}
          className="w-60"
        />

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
              onChange={(newDate) => {
                const formattedDate = format(newDate, "yyyy-MM-dd");
                setDate(formattedDate);
                filterData();
              }}
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
            {currentBookings.length > 0 ? (
              currentBookings.map((b) => (
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
                        <IoEllipsisHorizontal className="h-5 w-5 cursor-pointer" />
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
                <TableCell colSpan={5} className="text-center">
                  No redeemed bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md cursor-pointer"
            onClick={() =>
              handlePageChange(currentPage > 1 ? currentPage - 1 : 1)
            }
            disabled={currentPage === 1}
          >
            <IoChevronBack />
            <p>Previous</p>
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-200 rounded-md cursor-pointer"
            onClick={() =>
              handlePageChange(
                currentPage < totalPages ? currentPage + 1 : totalPages
              )
            }
            disabled={currentPage === totalPages}
          >
            <p>Next</p>
            <IoChevronForward />
          </button>
        </div>
        <div>
          <span>Items per page:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page on items per page change
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  const bookings = await client.fetch(
    `*[_type == "booking" && ticketStatus == "redeemed"] | order(createdAt desc) [0...50]`
  );

  return {
    props: {
      bookings, // Pass fetched data as props to the component
    },
  };
}

Redeemed.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Redeemed;
