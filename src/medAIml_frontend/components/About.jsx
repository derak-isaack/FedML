import React from 'react';

/**
 * About Component
 * Explains the concept of Federated Learning as far as blockchain is concerned.
 */
const About = () => {
  return (
    <div className="w-full max-w-2xl bg-steelblue-800 p-8 rounded-xl shadow-2xl mb-8 text-white">
      <h2 className="text-3xl font-bold text-steelblue-200 mb-4 text-center">About Federated Learning on Blockchain</h2>
      <p className="text-lg mb-4">
        Federated Learning (FL) is a machine learning approach that trains an algorithm across multiple decentralized edge devices or servers holding local data samples, without exchanging their data. This approach contrasts with traditional centralized machine learning techniques where all data is uploaded to a single server.
      </p>
      <p className="text-lg mb-4">
        In the context of **blockchain**, Federated Learning gains significant advantages, primarily in enhancing **data privacy, security, and transparency**:
      </p>
      <ul className="list-disc list-inside text-lg mb-4 space-y-2">
        <li>
          <strong>Decentralization & Immutability:</strong> Blockchain provides a decentralized and immutable ledger to record and verify the training process. Instead of a central server, model updates (gradients or trained model parameters) from various participants can be securely recorded on the blockchain. This ensures a tamper-proof history of how the global model evolved.
        </li>
        <li>
          <strong>Transparency & Auditability:</strong> Each model update can be cryptographically signed and timestamped on the blockchain. This allows for transparent auditing of contributions and ensures that no single participant can maliciously alter the training history without being detected.
        </li>
        <li>
          <strong>Incentivization:</strong> Smart contracts on a blockchain can be used to create incentive mechanisms. Participants who contribute valuable model updates (e.g., updates that significantly improve the global model's accuracy) can be automatically rewarded with cryptocurrency, encouraging participation and honest behavior.
        </li>
        <li>
          <strong>Security & Trust:</strong> Blockchain's cryptographic security features protect the integrity of model updates. Even though raw data remains local, the shared model parameters can be vulnerable. Blockchain helps ensure that only valid, authorized updates are incorporated into the global model, building trust among participants who might not inherently trust each other or a central orchestrator.
        </li>
        <li>
          <strong>Data Governance:</strong> Blockchain can facilitate decentralized data governance, allowing data owners to retain control over their data while still contributing to a collective learning process. This is particularly relevant in sensitive domains like healthcare, where data privacy regulations are stringent.
        </li>
      </ul>
      <p className="text-lg">
        By combining Federated Learning with blockchain, we move towards a more robust, private, and trustworthy AI ecosystem where collaborative intelligence can thrive without compromising individual data sovereignty.
      </p>
    </div>
  );
};

export default About;
