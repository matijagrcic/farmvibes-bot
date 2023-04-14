<?php

declare(strict_types=1);

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use PDO;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Helper\Table;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

/**
 * Allows enabling or disabling foreign key checks in
 * conjunction with doctrine:fixtures:load --purge-with-truncate.
 */
class DisableForeignKeyChecksCommand extends Command
{
    public const NAME = 'doctrine:schema:toggle-foreign-key-checks';
    // the name of the command (the part after "bin/console")
    protected static $defaultName = self::NAME;

    /**
     * Argument name for whether to enable or disable foreign key checking.
     */
    public const ARG_ENABLE = 'enable';
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager, string $name = null)
    {
        parent::__construct($name);
        $this->entityManager = $entityManager;
    }

    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this->setName(self::NAME)
            ->setDescription(
                'Toggles foreign key checking in Mysql.  Meant to be used ONLY with local fixture rebuilding via doctrine:fixtures:load --purge-with-truncate on mysql, and requires the SUPER privileged. See also https://github.com/doctrine/migrations/issues/43'
            )
            ->addArgument(
                self::ARG_ENABLE,
                InputArgument::REQUIRED,
                'Whether to enable or disable foreign key checking.  Required argument.  Must be equal to 0 (disable) or 1 (enable)'
            );
        parent::configure();
    }

    protected function interact(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);
        if (null === $input->getArgument(self::ARG_ENABLE)) {
            $enable_argument = $this->getDefinition()->getArgument(self::ARG_ENABLE);
            $choices = [0, 1];
            $enabled = $io->choice($enable_argument->getDescription(), $choices);
            $input->setArgument(self::ARG_ENABLE, $enabled);
        }
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $io = new SymfonyStyle($input, $output);
        $platform_name = $this->entityManager->getConnection()->getDatabasePlatform()->getName();
        if ('mysql' !== $platform_name) {
            $io->error(sprintf('Currently, the command %s only supports mysql (you are running %s)', self::NAME, $platform_name));

            return Command::FAILURE;
        }
        if (!in_array($input->getArgument(self::ARG_ENABLE), [0, 1])) {
            $io->error(sprintf('The value for argument %s needs to be either 0 or 1', self::ARG_ENABLE));

            return Command::FAILURE;
        }
        $enable = (bool) $input->getArgument(self::ARG_ENABLE);
        $connection = $this->entityManager->getConnection()->getWrappedConnection();
        $connection->exec(sprintf('SET FOREIGN_KEY_CHECKS = %d', $input->getArgument(self::ARG_ENABLE)));
        // Set globally as well, so this persists between doctrine calls.
        $connection->exec(sprintf('SET GLOBAL FOREIGN_KEY_CHECKS = %d', $input->getArgument(self::ARG_ENABLE)));

        $result = $connection->query('SHOW VARIABLES LIKE "foreign_key_checks"');

        $table = new Table($output);
        $table->setHeaders(['Variable', 'Value'])
            ->setRows($result->fetchAllAssociative());
        $table->render();
        if ($enable) {
            $io->info('Foreign key checks enabled.');
        } else {
            $io->warning('Foreign key checks disabled.  Be careful.');
        }

        return Command::SUCCESS;
    }
}

