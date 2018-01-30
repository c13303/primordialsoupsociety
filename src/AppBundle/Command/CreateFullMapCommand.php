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


class CreateFullMapCommand extends ContainerAwareCommand {

    protected function configure() {
        $this
                // the name of the command (the part after "bin/console")
                ->setName('app:create-fullmap')
                ->setDescription('Creates the full map.')
                ->setHelp('This command allows you to create a map place...')

        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output) {

        $em = $this->getContainer()->get('doctrine')->getManager();

        $map = $em->getRepository('AppBundle:Map');
        for($x=0;$x<Map::MAX_X;$x++)
        {
            for($y=0;$y<Map::MAX_Y;$y++)
            {
                $isthere = $em->getRepository('AppBundle:Map')->findOneBy(array('x'=>$x,'y'=>$y));
                if(!$isthere)
                {
                    $objectname='map'.$x.$y;
                    $$objectname = new Map();
                    $$objectname->setX($x);
                    $$objectname->setY($y);
                    $$objectname->setUser(null);
                    $$objectname->setName('Nouveau lieu');
                    $$objectname->setDescription('Vous êtes dans un lieu vide.');
                    $em->persist($$objectname);
                   
                }
            }
        }
         $em->flush();
         $output->writeln('ok bitch');
    }

}
