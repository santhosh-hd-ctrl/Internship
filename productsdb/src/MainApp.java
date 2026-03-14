public class MainApp {

    public static void main(String[] args) {

        ProductService service = new ProductService();

        service.priceGreaterThan500();
        service.findColorIndigo();
        service.countMaterialSoft();
        service.sortAscending();
        service.sortDescending();
        service.maxPrice();
        service.minPrice();
        service.averagePrice();
        service.priceBetween();
    }
}