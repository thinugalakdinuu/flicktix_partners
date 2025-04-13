import React, { useState, useEffect } from "react";
import { client } from "@/lib/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IoTrashOutline,
  IoAddOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const Add = () => {
  const [movies, setMovies] = useState([]);
  const [entries, setEntries] = useState([]);
  const [theaterId, setTheaterId] = useState("");

  useEffect(() => {
    const storedTheaterId = sessionStorage.getItem("theater_id");
    if (storedTheaterId) setTheaterId(storedTheaterId);

    const fetchMovies = async () => {
      const data = await client.fetch(`*[_type == "movie"]{_id, name}`);
      setMovies(data);
    };
    fetchMovies();
  }, []);

  const addMovieEntry = () => {
    setEntries([
      ...entries,
      {
        _key: uuidv4(),
        movieId: "",
        searchText: "",
        date: null,
        showtimes: [
          {
            _key: uuidv4(),
            time: "",
            period: "PM",
            reservedSeats: [],
          },
        ],
      },
    ]);
  };

  const handleMovieSearch = (index, text) => {
    const updated = [...entries];
    updated[index].searchText = text;
    updated[index].movieId = ""; // Clear the ID if user is typing again
    setEntries(updated);
  };

  const selectMovieFromSearch = (index, movie) => {
    const updated = [...entries];
    updated[index].movieId = movie._id;
    updated[index].searchText = movie.name;
    setEntries(updated);
  };

  const handleDateChange = (index, date) => {
    const updated = [...entries];
    updated[index].date = date ? format(date, "yyyy-MM-dd") : null;
    setEntries(updated);
  };

  const handleShowtimeChange = (entryIndex, showtimeIndex, value) => {
    const updated = [...entries];
    updated[entryIndex].showtimes[showtimeIndex].time = value;
    setEntries(updated);
  };

  const handlePeriodChange = (entryIndex, showtimeIndex, value) => {
    const updated = [...entries];
    updated[entryIndex].showtimes[showtimeIndex].period = value;
    setEntries(updated);
  };

  const handleReservedSeatsChange = (entryIndex, showtimeIndex, value) => {
    const updated = [...entries];
    updated[entryIndex].showtimes[showtimeIndex].reservedSeats = value
      .split(",")
      .map((s) => s.trim());
    setEntries(updated);
  };

  const addShowtime = (entryIndex) => {
    const updated = [...entries];
    updated[entryIndex].showtimes.push({
      _key: uuidv4(),
      time: "",
      period: "PM",
      reservedSeats: [],
    });
    setEntries(updated);
  };

  const removeShowtime = (entryIndex, showtimeIndex) => {
    const updated = [...entries];
    updated[entryIndex].showtimes.splice(showtimeIndex, 1);
    setEntries(updated);
  };

  const removeMovieEntry = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);
    setEntries(updated);
  };

  const handleSave = async () => {
    if (!theaterId) {
      toast.error("Theater ID is missing.", {
        style: {
          borderRadius: "1000px",
          background: "#B03C3F",
          color: "#fff",
        },
      });
      return;
    }
  
    // Filter out entries missing required fields
    const incompleteEntry = entries.find((entry) => {
      const missingMovieOrDate = !entry.movieId || !entry.date;
      const invalidShowtime = entry.showtimes.some((st) => !st.time);
      return missingMovieOrDate || invalidShowtime;
    });
  
    if (incompleteEntry) {
      toast.error("Please make sure all movie, date, and showtime fields are filled.", {
        style: {
          borderRadius: "1000px",
          background: "#B03C3F",
          color: "#fff",
        },
      });
      return;
    }
  
    const theater = await client.fetch(
      `*[_type == "theater" && _id == $theaterId][0]{dates}`,
      { theaterId }
    );
  
    const duplicateFound = entries.some((entry) => {
      return theater?.dates?.some((existingEntry) => {
        return (
          existingEntry?.showMovie?.[0]?.movieName?._ref === entry.movieId &&
          existingEntry.date === entry.date
        );
      });
    });
  
    if (duplicateFound) {
      toast.error("This movie already exists for the selected date.", {
        style: {
          borderRadius: "1000px",
          background: "#B03C3F",
          color: "#fff",
        },
      });
      return;
    }
  
    const newDates = entries.map((entry) => ({
      _key: uuidv4(),
      date: entry.date,
      showMovie: [
        {
          _key: uuidv4(),
          movieName: {
            _ref: entry.movieId,
            _type: "reference",
          },
          showtimes: entry.showtimes.map((st) => ({
            _key: uuidv4(),
            time: `${st.time} ${st.period}`,
            reservedSeats: st.reservedSeats,
          })),
        },
      ],
    }));
  
    try {
      await client
        .patch(theaterId)
        .setIfMissing({ dates: [] })
        .append("dates", newDates)
        .commit();
  
      toast.success("Configuration saved successfully!", {
        style: {
          borderRadius: "1000px",
          background: "#F4F6F5",
          color: "#000",
        },
      });
      setEntries([]);
    } catch (error) {
      toast.error("Error saving configuration.", {
        style: {
          borderRadius: "1000px",
          background: "#B03C3F",
          color: "#fff",
        },
      });
      console.error(error);
    }
  };
  

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Assign Movies to Dates</h1>

      <Button
        onClick={addMovieEntry}
        className="flex flex-row gap-2 text-white cursor-pointer"
      >
        <IoAddOutline />
        <p>Add Movie</p>
      </Button>

      {entries.map((entry, index) => {
        const filteredMovies = movies.filter((movie) =>
          movie.name.toLowerCase().includes(entry.searchText.toLowerCase())
        );

        return (
          <Card key={entry._key} className="p-4 space-y-4 border shadow-none">
            <div className="flex justify-between items-center">
              <label className="font-medium">Select Movie</label>
              <Button
                onClick={() => removeMovieEntry(index)}
                className="bg-white hover:bg-gray-100 cursor-pointer shadow-none flex flex-row gap-2 text-black"
              >
                <IoTrashOutline />
                <p>Remove Movie</p>
              </Button>
            </div>

            {/* Combined Input + Search Results */}
            <div className="relative w-72">
              <Input
                placeholder="Search Movies"
                value={entry.searchText}
                onChange={(e) => handleMovieSearch(index, e.target.value)}
              />
              {entry.searchText && filteredMovies.length > 0 && (
                <div className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full">
                  {filteredMovies.map((movie) => (
                    <div
                      key={movie._id}
                      onClick={() => selectMovieFromSearch(index, movie)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {movie.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div>
              <label className="block font-medium mb-1">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[280px] justify-start text-left font-normal"
                  >
                    <IoCalendarOutline className="mr-2 h-4 w-4" />
                    {entry.date ? format(entry.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={entry.date}
                    onSelect={(date) => handleDateChange(index, date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Showtimes */}
            {entry.showtimes.map((showtime, stIndex) => (
              <div
                key={showtime._key}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end"
              >
                <div>
                  <label className="block font-medium">Showtime</label>
                  <Input
                    placeholder="e.g. 07:00"
                    value={showtime.time}
                    onChange={(e) =>
                      handleShowtimeChange(index, stIndex, e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className="block font-medium">AM / PM</label>
                  <select
                    value={showtime.period}
                    onChange={(e) =>
                      handlePeriodChange(index, stIndex, e.target.value)
                    }
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium">
                    Unavailable Seats (comma separated)
                  </label>
                  <Input
                    placeholder="A1, A2, B4"
                    value={showtime.reservedSeats.join(", ")}
                    onChange={(e) =>
                      handleReservedSeatsChange(index, stIndex, e.target.value)
                    }
                  />
                </div>

                <div>
                  <Button
                    onClick={() => removeShowtime(index, stIndex)}
                    className="bg-white hover:bg-gray-100 cursor-pointer shadow-none flex flex-row gap-2 text-black"
                  >
                    <IoTrashOutline />
                    <p>Remove Showtime</p>
                  </Button>
                </div>
              </div>
            ))}

            <div>
              <Button
                variant="ghost"
                className="text-blue-600 flex flex-row gap-2 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => addShowtime(index)}
              >
                <IoAddOutline />
                <p>Add Showtime</p>
              </Button>
            </div>
          </Card>
        );
      })}

      {entries.length > 0 && (
        <div>
          <Button onClick={handleSave} className="cursor-pointer">Save Configuration</Button>
        </div>
      )}
    </div>
  );
};

Add.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default Add;
