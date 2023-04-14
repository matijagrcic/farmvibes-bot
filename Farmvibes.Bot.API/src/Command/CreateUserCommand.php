<?php

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use App\Entity\AdminUser;

class CreateUserCommand extends Command
{
    // the name of the command (the part after "bin/console")
    protected static $defaultName = 'app:create-user';
    private $passwordHasher;
    private $entityManager;
    private $defaultLocale = 'en';
    private bool $requirePassword = true;
    
    public function __construct(UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager)
    {
        // best practices recommend to call the parent constructor first and
        // then set your own properties. That wouldn't work in this case
        // because configure() needs the properties set in this constructors
        $this->passwordHasher = $passwordHasher;
        $this->entityManager = $entityManager;

        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            // the short description shown while running "php bin/console list"
            ->setDescription('Creates a new user.')
            ->setHelp('This command allows you to create a user...')
            ->addOption('email', NULl, InputOption::VALUE_REQUIRED, 'The email of the user.')
            ->addOption('firstName', 'f', InputOption::VALUE_REQUIRED, 'The first name of the user.')
            ->addOption('surname', 's', InputOption::VALUE_REQUIRED, 'The surname of the user.')
            ->addOption('password', 'p', $this->requirePassword ? InputOption::VALUE_REQUIRED : InputOption::VALUE_OPTIONAL, 'User password')
            ->addOption('language', 'l', InputOption::VALUE_OPTIONAL, 'Default user locale. If none is provided, we will go with english i.e. "en"')            
            ->addOption('group', 'g', InputOption::VALUE_OPTIONAL, 'The group of the user.')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        // outputs multiple lines to the console (adding "\n" at the end of each line)
        $output->writeln([
            'User Creator',
            '============',
            '',
        ]);

        $output->write('You are about to  create a user.');

        $user = new AdminUser();
        $user->setEmail($input->getOption('email'));
        $user->setFirstName($input->getOption('firstName'));
        $user->setSurname($input->getOption('surname'));
        $user->setLanguage($input->getOption('language') !== null ? $input->getOption('language') : $this->defaultLocale);
        $user->setPassword($this->passwordHasher->hashPassword(
            $user,
            $input->getOption('password')
            ));

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $output->writeln('User successfully generated!');

        $output->writeln('Username: '.$user->getEmail().' created.');

        return Command::SUCCESS;
    }
}