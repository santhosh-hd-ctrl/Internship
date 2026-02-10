import java.util.Arrays;

class SquareCheck {

    // Simple Point class to store coordinates
    static class Point {
        int x, y;
        Point(int x, int y) {
            this.x = x;
            this.y = y;
        }
    }

    // Function to calculate squared Euclidean distance
    static int distSq(Point p, Point q) {
        return (p.x - q.x) * (p.x - q.x) + (p.y - q.y) * (p.y - q.y);
    }

    static boolean isSquare(Point p1, Point p2, Point p3, Point p4) {
        // Calculate distances for all 6 possible pairs
        int[] dists = new int[6];
        dists[0] = distSq(p1, p2);
        dists[1] = distSq(p1, p3);
        dists[2] = distSq(p1, p4);
        dists[3] = distSq(p2, p3);
        dists[4] = distSq(p2, p4);
        dists[5] = distSq(p3, p4);

        // Sort the distances
        Arrays.sort(dists);

        // Check properties:
        // 1. dists[0] > 0 ensures points are not the same
        // 2. First 4 distances (sides) must be equal
        // 3. Last 2 distances (diagonals) must be equal
        // 4. Diagonals must be longer than sides
        if (dists[0] > 0 &&
            dists[0] == dists[1] && dists[1] == dists[2] && dists[2] == dists[3] &&
            dists[4] == dists[5] &&
            dists[4] > dists[0]) {
            return true;
        }
        
        return false;
    }

    public static void main(String[] args) {
        Point p1 = new Point(20, 10);
        Point p2 = new Point(10, 20);
        Point p3 = new Point(20, 20);
        Point p4 = new Point(10, 10);

        if (isSquare(p1, p2, p3, p4)) {
            System.out.println("Yes");
        } else {
            System.out.println("No");
        }
    }
}