<?php

$start = 'ours';

/* load classes */
require('model/ours.php');
require('controleur/main.php');
require('vue/json.php');




$main = new Main();

/* get vars */


if (!empty($_GET['action']))
    $action = filter_var($_GET['action'], FILTER_SANITIZE_STRING);


/* load page */

if (empty($action)) {
    $main->home();
} else {
    switch ($action) {
        case "test":
            $main->test();
            break;
        case "quiestla":
            $main->presence();
            break;
    }
}




