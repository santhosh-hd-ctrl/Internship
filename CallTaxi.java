import java.util.*;

class Taxi {
    int id, earnings = 0, freeTime = 0;
    char location = 'A';
    List<String> trips = new ArrayList<>();
    Taxi(int id) { this.id = id; }
}

public class CallTaxi {
    static List<Taxi> taxis = Arrays.asList(new Taxi(1), new Taxi(2), new Taxi(3), new Taxi(4));
    static int bookingId = 1;

    public static void book(int cid, char from, char to, int time) {
        int distToDrop = Math.abs(to - from);
        int fare = 100 + ((distToDrop * 15) - 5) * 10;
        Taxi allocated = null;
        int minEarnings = Integer.MAX_VALUE, minDist = Integer.MAX_VALUE;

        for (Taxi t : taxis) {
            int distToPickup = Math.abs(t.location - from);
            if (t.freeTime + distToPickup <= time) {
                if (distToPickup < minDist || (distToPickup == minDist && t.earnings < minEarnings)) {
                    allocated = t;
                    minDist = distToPickup;
                    minEarnings = t.earnings;
                }
            }
        }

        if (allocated != null) {
            allocated.location = to;
            allocated.freeTime = time + distToDrop;
            allocated.earnings += fare;
            allocated.trips.add(String.format("%d\t\t%d\t\t%c\t%c\t%d\t\t%d\t\t%d", 
                bookingId++, cid, from, to, time, allocated.freeTime, fare));
            
            System.out.println("Taxi can be allotted.\nTaxi-" + allocated.id + " is allotted\n");
        } else {
            System.out.println("Booking Rejected\n");
        }
    }

    public static void display() {
        for (Taxi t : taxis) {
            if (!t.trips.isEmpty()) {
                System.out.println("Taxi-" + t.id + "\tTotal Earnings: Rs. " + t.earnings);
                System.out.println("BookingID\tCustomerID\tFrom\tTo\tPickupTime\tDropTime\tAmount");
                for (String trip : t.trips) System.out.println(trip);
                System.out.println();
            }
        }
    }

    public static void main(String[] args) {
        book(123, 'A', 'B', 9);
        book(234, 'B', 'D', 9);
        book(345, 'B', 'C', 12);
        
        display();
    }
}