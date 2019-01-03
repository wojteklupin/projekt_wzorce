create table klienci (
    nr_rachunku  serial      primary key,
    nazwisko     varchar(20) not null,
    imie         varchar(20) not null,
    bank         varchar(10) not null references banki,
    pieniadze    integer     not null
);

create table banki (
    bank         varchar(10) not null primary key,
    laczna_suma  integer     not null
);

insert into banki (bank, laczna_suma) values
('pekao', 0),
('ing', 0),
('alior', 0);