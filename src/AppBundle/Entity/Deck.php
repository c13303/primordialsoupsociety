<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Deck
 *
 * @ORM\Table(name="deck")
 * @ORM\Entity(repositoryClass="AppBundle\Repository\DeckRepository")
 */
class Deck
{
    CONST NB_CARDS = 30;
    CONST HAND = 6;
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\User")
     * @ORM\JoinColumn(nullable=false)
     */
    private $user;

    /**
    * @ORM\ManyToOne(targetEntity="AppBundle\Entity\Card")
    * @ORM\JoinColumn(nullable=false)
    */
     private $card;

    /**
     * @var int
     *
     * @ORM\Column(name="hand_position", type="integer", nullable=true)
     */
    private $handPosition;


    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    
    /**
     * Set card
     *
     * @param integer $card
     *
     * @return Deck
     */
    public function setCard($card)
    {
        $this->card = $card;

        return $this;
    }

    /**
     * Get card
     *
     * @return int
     */
    public function getCard()
    {
        return $this->card;
    }

    /**
     * Set handPosition
     *
     * @param integer $handPosition
     *
     * @return Deck
     */
    public function setHandPosition($handPosition)
    {
        $this->handPosition = $handPosition;

        return $this;
    }

    /**
     * Get handPosition
     *
     * @return int
     */
    public function getHandPosition()
    {
        return $this->handPosition;
    }

    /**
     * Set user
     *
     * @param \AppBundle\Entity\User $user
     *
     * @return Deck
     */
    public function setUser(\AppBundle\Entity\User $user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \AppBundle\Entity\User
     */
    public function getUser()
    {
        return $this->user;
    }
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->card = new \Doctrine\Common\Collections\ArrayCollection();
    }

    
}
