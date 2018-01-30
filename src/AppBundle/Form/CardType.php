<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use AppBundle\Entity\Card;

class CardType extends AbstractType {

    /**
     * {@inheritdoc}
     */
    public function buildForm(FormBuilderInterface $builder, array $options) {
        for ($i = 0; $i < sizeof(Card::TYPES); $i++) {
            $choicearray[Card::TYPES[$i]] = Card::TYPES[$i];
        }

        $builder
                ->add('name', null, array('label' => 'nom'));

        $builder->add('type', ChoiceType::class, array(
                    'label' => 'type',
                    'choices' => $choicearray
                ))
                ->add('karma', null, array('label' => 'impact : karma'))
                ->add('sanity', null, array('label' => 'impact : santé mentale'))
                ->add('sex', null, array('label' => 'impact : sex-appeal'))
                ->add('specialName', null, array('label' => 'artefact (randomly generated only)'))
                ->add('turns', null, array('label' => 'nombre de tours pour se recharger'))
                ->add('frequency', null, array('label' => 'rareté (1 = rare, 100 = frequent)'))
                ->add('description', TextareaType::class, array(
                    'label' => 'description',
                    'required' => false
                ))
        ;

        //
        $builder->add('file', HiddenType::class)
                ->add('save', SubmitType::class, array('label' => 'Add Carte'));
    }

    /**
     * {@inheritdoc}
     */
    public function configureOptions(OptionsResolver $resolver) {
        $resolver->setDefaults(array(
            'data_class' => 'AppBundle\Entity\Card'
        ));
    }

    /**
     * {@inheritdoc}
     */
    public function getBlockPrefix() {
        return 'appbundle_card';
    }

}
