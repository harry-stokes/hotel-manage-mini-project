
const bookingForm = document.getElementById("bookingForm");
const result = document.getElementById("result");

const availabilityDate = document.getElementById("availabilityDate");
const checkAvailability = document.getElementById("checkAvailability");
const availabilityResult = document.getElementById("availabilityResult");

// Demo room availability data
function getRoomsAvailable(dateString) {
    const date = new Date(dateString + "T00:00:00");
    const day = date.getDay();

    // Sunday and Saturday have fewer rooms in this demo
    if (day === 0 || day === 6) {
        return {
            single: 2,
            double: 3,
            deluxe: 1
        };
    }

    // Wednesday is a low-demand day in this demo
    if (day === 3) {
        return {
            single: 5,
            double: 4,
            deluxe: 3
        };
    }

    // Other weekdays
    return {
        single: 4,
        double: 3,
        deluxe: 2
    };
}

// Check room availability
checkAvailability.addEventListener("click", function() {
    const dateString = availabilityDate.value;

    if (!dateString) {
        availabilityResult.textContent = "Please select a date.";
        return;
    }

    const rooms = getRoomsAvailable(dateString);

    availabilityResult.innerHTML = `
        <h3>Available Rooms</h3>
        <p>Single Rooms: ${rooms.single}</p>
        <p>Double Rooms: ${rooms.double}</p>
        <p>Deluxe Rooms: ${rooms.deluxe}</p>
        <p><strong>Total Vacant Rooms: ${rooms.single + rooms.double + rooms.deluxe}</strong></p>
    `;
});

// Parking slots demo
const parkingSlots = [
    { name: "P1", status: "free" },
    { name: "P2", status: "occupied" },
    { name: "P3", status: "free" },
    { name: "P4", status: "occupied" },
    { name: "P5", status: "free" },
    { name: "P6", status: "free" },
    { name: "P7", status: "occupied" },
    { name: "P8", status: "free" }
];

const parkingContainer = document.getElementById("parkingContainer");
const parkingSummary = document.getElementById("parkingSummary");

let vacantSlots = 0;
let occupiedSlots = 0;

parkingSlots.forEach(function(slot) {
    const div = document.createElement("div");

    div.className = "parking-slot " + slot.status;
    div.textContent = slot.name + " - " + (
        slot.status === "free" ? "Vacant" : "Occupied"
    );

    parkingContainer.appendChild(div);

    if (slot.status === "free") {
        vacantSlots++;
    } else {
        occupiedSlots++;
    }
});

parkingSummary.textContent =
    "Vacant Slots: " + vacantSlots +
    " | Occupied Slots: " + occupiedSlots +
    " | Total Slots: " + parkingSlots.length;

// Room prices
const roomPrices = {
    single: { weekday: 1500, weekend: 1800 },
    double: { weekday: 2500, weekend: 3000 },
    deluxe: { weekday: 4000, weekend: 4800 }
};

// Friday and Saturday are weekend days in this demo
function isWeekend(date) {
    const day = date.getDay();
    return day === 5 || day === 6;
}

// Booking calculation
bookingForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const roomType = document.getElementById("room").value;
    const checkin = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;

    const startDate = new Date(checkin + "T00:00:00");
    const endDate = new Date(checkout + "T00:00:00");

    if (!roomType || !checkin || !checkout) {
        result.textContent = "Please fill all booking details.";
        return;
    }

    if (endDate <= startDate) {
        result.textContent = "Check-out date must be after check-in date.";
        return;
    }

    let total = 0;
    let weekdayNights = 0;
    let weekendNights = 0;

    const currentDate = new Date(startDate);

    while (currentDate < endDate) {
        if (isWeekend(currentDate)) {
            total += roomPrices[roomType].weekend;
            weekendNights++;
        } else {
            total += roomPrices[roomType].weekday;
            weekdayNights++;
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    const roomName = {
        single: "Single Room",
        double: "Double Room",
        deluxe: "Deluxe Room"
    };

    result.replaceChildren();

    const confirmation = document.createElement("div");
    confirmation.className = "confirmation";

    const heading = document.createElement("h3");
    heading.textContent = "Booking Cost Summary";

    confirmation.appendChild(heading);

    const details = [
        "Name: " + name,
        "Email: " + email,
        "Room Type: " + roomName[roomType],
        "Check-in: " + checkin,
        "Check-out: " + checkout,
        "Weekday Nights: " + weekdayNights,
        "Weekend Nights: " + weekendNights,
        "Total Nights: " + (weekdayNights + weekendNights),
        "Total Amount: ₹" + total
    ];

    details.forEach(function(detail) {
        const paragraph = document.createElement("p");
        paragraph.textContent = detail;
        confirmation.appendChild(paragraph);
    });

    const message = document.createElement("p");
    message.textContent = "Booking cost calculated successfully!";
    confirmation.appendChild(message);

    result.appendChild(confirmation);
});

const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");

if (checkin && checkout) {

    const today = new Date();
    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    checkin.min = localDate;
    checkout.min = localDate;

    checkin.addEventListener("change", function() {
        checkout.min = checkin.value;

        if (checkout.value && checkout.value <= checkin.value) {
            checkout.value = "";
        }
    });
}

