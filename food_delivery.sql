create database food_delivery;
use food_delivery;
create table customer (
    customer_id int primary key auto_increment,
    cust_name varchar(100),
    phone varchar(15));
insert into customer (customer_id, cust_name, phone) values
(1,'rahul','9876543210'),
(2,'anita','9123456780'),
(3,'kiran','9988776655');

select * from customer;

create table restaurant (
    restaurant_id int primary key auto_increment,
    rest_name varchar(100),
    location varchar(150),
    phone varchar(15));
 
 insert into restaurant ( restaurant_id, rest_name, location, phone) values
 (201, 'empire',  'mysuru', 9535805139),
 (202, 'rr mess',  'mandya', 9353628051),
 (203, 'ashirvad',  'banglore', 9858365392);
 
 select * from restaurant;
 
create table delivery_person (
    delivery_person_id int primary key auto_increment,
    delper_name varchar(100),
    phone varchar(15));
    
insert into delivery_person ( delivery_person_id, delper_name, phone) values
(301,'ramesh','9858359026'),
(302,'mukesh','6362589352'),
(303,'girish','8749381349');

select * from delivery_person;
    
create table food_item (
    food_id int primary key auto_increment,
    food_name varchar(100),
    price decimal(10,2),
    restaurant_id int,
    foreign key (restaurant_id) references restaurant(restaurant_id));
    
insert into  food_item ( food_id, food_name, price, restaurant_id) values
(401,'idli',60.00,201),
(402,'dosa',70.00,201),
(403,'ricebath',40.00,202),
(404,'vada',40.00,202),
(405, 'biriyani',150.00,203),
(406, 'chicken kabab',160.00,203);

select * from food_item;
    
create table `order` (
    order_id int primary key auto_increment,
    order_date datetime,
    total_amount decimal(10,2),
    customer_id int,
    delivery_person_id int,
    foreign key (customer_id) references customer(customer_id),
    foreign key (delivery_person_id) references delivery_person(delivery_person_id));
    drop table `order`;
create table order_details (
    order_id int primary key auto_increment,
    order_date datetime,
    total_amount decimal(10,2),
    customer_id int,
    delivery_person_id int,
    foreign key (customer_id) references customer(customer_id),
    foreign key (delivery_person_id) references delivery_person(delivery_person_id));
    
insert into order_details (order_id, order_date, total_amount, customer_id, delivery_person_id) values
(501,now(),80.00,1,301),
(502,now(),70.00,2,302),
(503,now(),160.00,1,303),
(504,now(),150.00,3,301),
(505,now(),130.00,2,302),
(506,now(),100.00,3,303);

select * from order_details;
    
create table order_item (
    order_id int,
    food_id int,
    quantity int,
    subtotal decimal(10,2),
    primary key (order_id, food_id),
    foreign key (order_id) references order_details (order_id),
    foreign key (food_id) references food_item (food_id));
    
insert into  order_item ( order_id, food_id, quantity,  subtotal) values
(501,401,1,60.00),
(501,404,1,40.00),
(502,402,1,70.00),
(503,406,1,160.00),
(504,405,1,150.00),
(505,403,2,80.00),
(506,404,2,80.00);

select * from order_item;
use food_delivery;
select * from order_details;
select * from order_item;