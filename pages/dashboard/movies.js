import React, { useEffect, useState } from "react";
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
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar"; // Import ShadCN Calendar
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"; // Import Popover

const Movies = () => {
  const [schedule, setSchedule] = useState([]);
  const [flatData, setFlatData] = useState([]);
  const [filterMovie, setFilterMovie] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const [theaterId, setTheaterId] = useState("");

  useEffect(() => {
    const theaterIdData = sessionStorage.getItem("theater_id");
    setTheaterId(theaterIdData);
  }, []);

  useEffect(() => {
    const fetchTheaterMovies = async () => {
      if (!theaterId) return;

      const data = await client.fetch(
        `*[_type == "theater" && _id == $theaterId][0]{
          dates[] {
            date,
            showMovie[] {
              movieName->{
                _id,
                name
              },
              showtimes[] {
                time,
                reservedSeats
              }
            }
          }
        }`,
        { theaterId }
      );

      const flat = [];

      data?.dates?.forEach((day) => {
        day.showMovie?.forEach((movie) => {
          movie.showtimes?.forEach((show) => {
            flat.push({
              movieId: movie.movieName._id,
              movieName: movie.movieName.name,
              date: day.date,
              time: show.time,
              reservedSeats: show.reservedSeats || [],
            });
          });
        });
      });

      setSchedule(flat);
      setFlatData(flat);
    };

    fetchTheaterMovies();
  }, [theaterId]);

  const movieOptions = [...new Set(schedule.map((m) => m.movieName))];

  const filtered = flatData.filter((item) => {
    return (
      (filterMovie ? item.movieName === filterMovie : true) &&
      (filterDate ? item.date === filterDate : true)
    );
  });

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Scheduled Movies</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select onValueChange={setFilterMovie}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Filter by Movie" />
          </SelectTrigger>
          <SelectContent>
            {movieOptions.map((movie) => (
              <SelectItem key={movie} value={movie}>
                {movie}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Popover with ShadCN Calendar */}
        <Popover>
          <PopoverTrigger asChild>
            <Input
              type="text"
              value={filterDate}
              placeholder="Select Date"
              readOnly
              className="w-48"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              selected={filterDate ? new Date(filterDate) : undefined}
              onSelect={(date) => {
                if (date) setFilterDate(format(date, "yyyy-MM-dd"));
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
              <TableHead className="w-64">Movie</TableHead>
              <TableHead className="w-40">Date</TableHead>
              <TableHead className="w-32">Time</TableHead>
              <TableHead className="w-64">Reserved Seats</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((item, index) => {
                const formattedDate = item.date;
                const formattedTime = item.time;

                return (
                  <TableRow key={index}>
                    <TableCell>{item.movieName}</TableCell>
                    <TableCell>{formattedDate}</TableCell>
                    <TableCell>{formattedTime}</TableCell>
                    <TableCell>
                      {item.reservedSeats.length > 3
                        ? item.reservedSeats.slice(0, 3).join(", ") + "..."
                        : item.reservedSeats.length > 0
                          ? item.reservedSeats.join(", ")
                          : "None"}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No scheduled movies found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

Movies.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Movies;
