<?php

/* Fromage Interactif ALL RIGHTS RESERVED */

namespace AppBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use AppBundle\Entity\Map;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Console\Output\StreamOutput;


class CreateMapCommand extends ContainerAwareCommand {

    protected function configure() {
        $this
                // the name of the command (the part after "bin/console")
                ->setName('app:create-map')
                ->setDescription('Creates a new map place.')
                ->setHelp('This command allows you to create a map place...')
                ->addArgument('x', InputArgument::REQUIRED, 'x')
                ->addArgument('y', InputArgument::REQUIRED, 'y')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output) {
        $x = $input->getArgument('x');
        $y = $input->getArgument('y');
        if($x<0 || $y < 0 || $x>Map::MAX_X || $y>Map::MAX_Y)
        {
            $output->writeln(null);
        }
        
        $em = $this->getContainer()->get('doctrine')->getManager();

        $map = new Map();
        $map->setX($x);
        $map->setY($y);
        $map->setName('Nouveau lieu');
        $map->setDescription('Vous êtes dans un lieu vide.');
        $em->persist($map);
        $em->flush();
        $array=array('id'=>$map->getId(),'x'=>$map->getX(),'y'=>$map->getY()
                ,'name'=>$map->getName()
                ,'description'=>$map->getDescription()
                ,'user_id'=>null
                );
         $output->write(json_encode($array));
    }

}
